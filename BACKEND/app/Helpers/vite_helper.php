
<?php

if (! function_exists('vite_tags')) {
    function vite_tags(string $entry = 'resources/ts/app.ts'): string
    {
        $manifestPath = FCPATH . 'build/.vite/manifest.json';
        $hotFile = FCPATH . 'hot';

        if (is_file($hotFile)) {
            $devServer = trim(file_get_contents($hotFile));

            return '<script type="module" src="' . esc($devServer . '/@vite/client') . '"></script>'
                . '<script type="module" src="' . esc($devServer . '/' . $entry) . '"></script>';
        }

        if (! is_file($manifestPath)) {
            return '';
        }

        $manifest = json_decode(file_get_contents($manifestPath), true);

        if (! isset($manifest[$entry])) {
            return '';
        }

        $html = '';

        foreach ($manifest[$entry]['css'] ?? [] as $cssFile) {
            $html .= '<link rel="stylesheet" href="' . base_url('build/' . $cssFile) . '">' . PHP_EOL;
        }

        if (isset($manifest[$entry]['file'])) {
            $html .= '<script type="module" src="' . base_url('build/' . $manifest[$entry]['file']) . '"></script>';
        }

        return $html;
    }
}
