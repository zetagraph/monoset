<?php

/**
 * @file
 * Provides an additional config form for theme settings.
 */

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Menu\MenuTreeStorage;

/**
 * Implements hook_form_system_theme_settings_alter().
 *
 * Form override for theme settings.
 */
function monoset_form_system_theme_settings_alter(array &$form, FormStateInterface $form_state) {
  $menus = [];
  $theme_name = \Drupal::theme()->getActiveTheme()->getName();
  $config = \Drupal::configFactory();
  foreach ($config->listAll() as $entry) {
    if (strstr($entry, 'system.menu.')) {
      $data = $config->get($entry)->getRawData();
      $menus[$data['id']] = $data['label'];
    }
  }
  $form['options_settings'] = [
    '#type' => 'fieldset',
    '#title' => t('@theme Specific Settings', ['@theme' => ucfirst($theme_name)]),
  ];

  // Material Icons
  $form['options_settings']['monoset_material_icons'] = [
    '#type' => 'fieldset',
    '#title' => t('Menus Supporting <a href=":gmi_href" target="_blank">Google Material Icons</a>', [':gmi_href' => 'https://design.google.com/icons/']),
    '#description' => t('Link titles which look like font ligatures such as text "face" will be replaced to the font symbol <span style="color: #9e9e9e;font-size: 24px">☻</span>. Also, HTML elements assigned class="material-icons" or title="_ ANY TITLE HAVING UNDERSCORE SIGN IN THE BEGINNING" will convert ligatures into their symbols. Either ligature "face" or code point "&amp;#xE87C;" might be used for elements. Check <a href=":lcp_href" target="_blank">the list of available "ligature code_point"</a> pairs.', [':lcp_href' => 'https://github.com/google/material-design-icons/blob/master/iconfont/codepoints/']),
  ];

  $form['options_settings']['monoset_material_icons']['material_icon_menus'] = [
    '#type' => 'checkboxes',
    '#options' => $menus,
    '#default_value' => array_keys(array_filter(theme_get_setting('material_icon_menus') ?: [])) ?: [],
  ];

  // All default settings are left untouched, the #validate members including.
  $form['#validate'][] = 'monoset_form_system_theme_settings_validate';
}

function monoset_form_system_theme_settings_validate(array &$form, FormStateInterface $form_state) {
  if (function_exists('file_save_upload')) {
    // Handle file uploads.
    $image_factory = \Drupal::service('image.factory');
    $supported_extensions = $image_factory->getSupportedExtensions();
    // By default .svg is not allowed to upload for a logo.
    $supported_extensions[] = 'svg';
    $validators = ['file_validate_extensions' => [implode(' ', $supported_extensions)]];

    // Check for a new uploaded logo.
    $file = file_save_upload('logo_upload', $validators, FALSE, 0);
    if (isset($file)) {
      // File upload was attempted.
      if ($file) {
        // Put the temporary file in form_values so we can save it on submit.
        $form_state->setValue('logo_upload', $file);
      }
      else {
        // File upload failed.
        $form_state->setErrorByName('logo_upload', t('The logo could not be uploaded.'));
      }
    }
  }
}
