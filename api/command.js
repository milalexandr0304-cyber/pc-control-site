// Принудительное обновление конфигурации сервера
import { createClient } from '@supabase/supabase-js'


console.log("--- ДЕБАГ СЕРВЕРА ---");
console.log("SUPABASE_URL из настроек:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY есть в системе?:", process.env.SUPABASE_KEY ? "Да" : "Нет");

// Подключаем базу данных (переменные подставятся из настроек Vercel автоматически)

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default async function handler(req, res) {
  // Если сайт просто открыли — отдаем последние характеристики ПК
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('pc_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // Если нажали кнопку выключения — проверяем кодовое слово на сервере
  if (req.method === 'POST') {
    const { codeword, action } = req.body;

    if (!codeword || codeword !== process.env.SECRET_WORD) {
      return res.status(401).json({ error: 'Неверное кодовое слово!' });
    }

    if (action === 'shutdown') {
      const { data, error } = await supabase
        .from('pc_commands')
        .insert([{ command: 'shutdown', is_executed: false }]);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ status: 'success' });
    }
  }

  return res.status(405).json({ error: 'Метод не поддерживается' });
}
