<?php
require_once __DIR__ . '/db.php';

try {
    $settings = $pdo->query('SELECT * FROM settings LIMIT 1')->fetch() ?: [];
    $about = $pdo->query('SELECT * FROM about LIMIT 1')->fetch() ?: [];
    $jadwal = $pdo->query('SELECT * FROM jadwal ORDER BY urutan ASC, id ASC')->fetchAll();
    $disciplines = $pdo->query('SELECT * FROM disciplines ORDER BY urutan ASC, id ASC')->fetchAll();
    $news = $pdo->query('SELECT * FROM news ORDER BY id DESC')->fetchAll();
    $gallery = $pdo->query('SELECT * FROM gallery ORDER BY tanggal DESC, id DESC')->fetchAll();
    $merchandise = $pdo->query('SELECT * FROM merchandise ORDER BY id ASC')->fetchAll();

    $about['jadwal'] = ['items' => $jadwal];

    echo json_encode([
        'success' => true,
        'data' => [
            'settings' => $settings,
            'about' => $about,
            'jadwal' => $jadwal,
            'disciplines' => $disciplines,
            'news' => $news,
            'gallery' => $gallery,
            'merchandise' => $merchandise
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
