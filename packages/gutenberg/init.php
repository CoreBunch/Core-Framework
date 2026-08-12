<?php

add_action('enqueue_block_editor_assets', 'gutenpro_admin_enqueue_scripts');

function gutenpro_admin_enqueue_scripts()
{
    $script_handle = 'gutenpro-script';
    $script_path = 'build/index.js';
    $script_asset_path = dirname(__FILE__) . '/build/index.asset.php';
    $script_asset = file_exists($script_asset_path)
        ? require $script_asset_path
        : array(
            'dependencies' => array(),
            'version' => filemtime($script_path),
        );
    $script_url = plugins_url($script_path, __FILE__);
    wp_enqueue_script($script_handle, $script_url, $script_asset['dependencies'], $script_asset['version']);
    wp_enqueue_style('wp-format-library');
    wp_enqueue_style(
        'gutenpro--styles',
        // Handle.
        plugins_url('build/index.css', __FILE__),
        // Block editor CSS.
        array('wp-edit-blocks'),
        // Dependency to include the CSS after it.
        filemtime(dirname(__FILE__) . '/build/index.css') // Version: File modification time.
    );
}
