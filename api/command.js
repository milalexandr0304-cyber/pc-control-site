import { createClient } from '@supabase/supabase-js';

console.log("--- ДЕБАГ СЕРВЕРА ---");
console.log("SUPABASE_URL из настроек:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY есть в системе?:", process.env.SUPABASE_KEY ? "Да" : "Нет");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async (req) => {
  // Обработка GET-запроса (Отправка статистики на сайт)
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('pc_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  // Обработка POST-запроса (Кнопка выключения)
  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json(); 
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Ошибка чтения данных' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { codeword, action } = body;

    // Сверка кодового слова
    if (!codeword || codeword !== process.env.SECRET_WORD) {
      return new Response(JSON.stringify({ error: 'Неверное кодовое слово!' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    if (action === 'shutdown') {
      const { error } = await supabase
        .from('pc_commands')
        .insert([{ command: 'shutdown', is_executed: false }]);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
      
      return new Response(JSON.stringify({ status: 'success' }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  // Если метод не распознан
  return new Response(JSON.stringify({ error: 'Метод не поддерживается' }), { 
    status: 405, 
    headers: { 'Content-Type': 'application/json' } 
  });
};
