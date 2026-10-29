// Migração one-shot: lê os treinos antigos do localStorage e insere no Supabase.
// Roda silenciosa no primeiro login pós-deploy, só uma vez por user.
//
// =====================================================================
// PRE-MORTEM (cenários onde isso pode dar errado + mitigação)
// =====================================================================
// 1. User OFFLINE no primeiro login pós-deploy.
//    - getSession resolve (sessão vem do localStorage do Supabase), mas o
//      INSERT falha com erro de rede.
//    - Mitigação: try/catch em volta da função inteira. Em qualquer erro,
//      mantém a chave dojoActivities_<id> intacta E não cria a flag.
//      Próximo login online → re-tenta.
//
// 2. Perda de conexão NO MEIO do batch (algumas rows inseridas, outras não).
//    - Risco: se tentasse de novo, duplicava os treinos já inseridos.
//    - Mitigação: usamos UM único INSERT com array (operação atômica no
//      Supabase; falha → nenhuma row entra). A flag só é criada DEPOIS do
//      insert bem-sucedido. Se a conexão cair no meio, tudo volta ao estado
//      anterior e re-roda no próximo login.
//    - Fotos: são uploadadas serialmente ANTES do insert. Se uma foto falha,
//      aceitamos foto=null e seguimos (user não perde o registro do treino).
//      Fotos uploadadas antes de um erro final de insert ficam "órfãs" no
//      bucket — custo baixo, aceitável.
//
// 3. Campos do localStorage que NÃO cabem no schema atual.
//    - O addActivity antigo gravava: local, positions, partner, rolls,
//      submissions, caught, note. O schema v1 só tem sport, duration_min,
//      distance_km, comment, mood, photo_url, created_at.
//    - Mitigação: migramos SÓ os campos suportados. Os outros são dropados
//      (log de aviso se detectarmos entry com campo descartado). Se Felipe
//      quiser recuperar, uma migration v4 reabre esses campos.
//
// 4. DUPLA migração se a flag não salvar.
//    - Risco: insert roda OK, setItem da flag falha (quota, modo privado) →
//      próximo login re-migra → DUPLICATAS no Supabase.
//    - Mitigação: setamos a FLAG PRIMEIRO (depois do insert OK), e só
//      DEPOIS removemos a chave antiga. Se setItem da flag falhar, logamos
//      e abortamos ANTES de deletar — próxima tentativa vai ver flag=null
//      MAS também vai ver a key original + agora rows já inseridas →
//      duplicata. Esse caso é raro (uma string de 20 chars não estoura
//      quota) e documentado aqui como risco conhecido.
//    - Mitigação adicional: um sanity check — se já existir qualquer row
//      no Supabase pra esse user, pulamos a migração (bail out seguro).
//
// 5. RACE CONDITION com um addActivity novo chamado durante a migração.
//    - addActivity novo grava direto no Supabase (não toca localStorage).
//    - A migração lê o snapshot do localStorage uma vez e insere. Não há
//      race na fonte de dados: o novo treino vai pro DB, os antigos vão
//      pro DB também. Ordem fica correta via created_at (os antigos
//      preservam seu created_at original; o novo usa agora).
//    - Único efeito possível: se addActivity novo rodar ANTES do nosso
//      sanity check de "já tem row no DB", abortamos a migração e nunca
//      migramos os antigos. Mitigação: sanity check só aborta se encontrar
//      row MAIS ANTIGA que a entry mais recente do localStorage — se o
//      row for recente (addActivity recém-feito), prosseguimos.
//      Simplificação pragmática: aceitamos abortar — Felipe pode reportar
//      que faltou histórico e a gente roda uma migração manual depois.
// =====================================================================

import { supabase } from '@/lib/supabase';

const legacyKey = (userId) => `dojoActivities_${userId}`;
const migrationFlag = (userId) => `dojoMigrated_v3_${userId}`;

// Converte um dataURL em Blob pra upload.
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

const uploadLegacyPhoto = async (userId, photo) => {
  if (!photo || typeof photo !== 'string' || !photo.startsWith('data:')) return null;
  try {
    const blob = await dataUrlToBlob(photo);
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${userId}/legacy-${Date.now()}-${rand}.jpg`;
    const { error } = await supabase.storage
      .from('training-photos')
      .upload(path, blob, { upsert: false, contentType: 'image/jpeg' });
    if (error) {
      console.warn('[migration] photo upload failed:', error.message);
      return null;
    }
    const { data } = supabase.storage.from('training-photos').getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (err) {
    console.warn('[migration] photo exception:', err);
    return null;
  }
};

export const migrateLegacyActivities = async (userId) => {
  if (!userId) return;
  try {
    // Flag já marcada: nada a fazer.
    if (localStorage.getItem(migrationFlag(userId))) return;

    const raw = localStorage.getItem(legacyKey(userId));
    if (!raw) {
      // Sem dados antigos — marca a flag pra não re-tentar.
      try { localStorage.setItem(migrationFlag(userId), '1'); } catch {}
      return;
    }

    let legacy;
    try {
      legacy = JSON.parse(raw);
    } catch {
      console.warn('[migration] legacy JSON corrupted — skipping');
      return;
    }
    if (!Array.isArray(legacy) || legacy.length === 0) {
      try { localStorage.setItem(migrationFlag(userId), '1'); } catch {}
      return;
    }

    // Sanity check (ver pré-mortem #4): se já tem qualquer activity no DB,
    // aborta pra não duplicar. Caso raro (user deslogou/relogou após uso novo).
    const { count, error: countErr } = await supabase
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (countErr) {
      console.warn('[migration] count check failed:', countErr.message);
      return;
    }
    if ((count || 0) > 0) {
      console.info('[migration] user já tem activities no DB — pulando migração legacy');
      try { localStorage.setItem(migrationFlag(userId), '1'); } catch {}
      return;
    }

    // Upload serial das fotos (se foto falhar, segue sem).
    const rows = [];
    for (const entry of legacy) {
      const photoUrl = entry.photo
        ? await uploadLegacyPhoto(userId, entry.photo)
        : null;

      const toInt = (v) => {
        if (v === undefined || v === null || v === '') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };
      const toFloat = (v) => {
        if (v === undefined || v === null || v === '') return null;
        const n = Number(String(v).replace(',', '.'));
        return Number.isFinite(n) && n > 0 ? n : null;
      };

      // Avisa quando entry traz campo que não vai migrar.
      const dropped = ['local', 'positions', 'partner', 'rolls', 'submissions', 'caught', 'note']
        .filter((k) => entry[k] != null && entry[k] !== '');
      if (dropped.length) {
        console.info('[migration] dropped unsupported fields:', dropped.join(', '));
      }

      rows.push({
        user_id: userId,
        sport: entry.sport || null,
        duration_min: toInt(entry.durationMin),
        distance_km: toFloat(entry.distanceKm),
        comment: entry.comment ? String(entry.comment).slice(0, 240) : (entry.note ? String(entry.note).slice(0, 240) : null),
        mood: entry.mood || null,
        photo_url: photoUrl,
        created_at: entry.date || new Date().toISOString()
      });
    }

    // Insert atômico (ver pré-mortem #2).
    const { error: insErr } = await supabase.from('activities').insert(rows);
    if (insErr) {
      console.warn('[migration] insert failed, keeping localStorage:', insErr.message);
      return;
    }

    // Flag PRIMEIRO (ver pré-mortem #4), depois remove a key antiga.
    try {
      localStorage.setItem(migrationFlag(userId), '1');
      localStorage.removeItem(legacyKey(userId));
      console.info(`[migration] ${rows.length} activities migradas pro Supabase`);
    } catch (err) {
      console.warn('[migration] flag write failed:', err);
    }
  } catch (err) {
    console.warn('[migration] unexpected error, keeping localStorage:', err);
  }
};
