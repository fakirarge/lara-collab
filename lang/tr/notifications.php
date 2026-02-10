<?php

return [
    // Task Notifications
    'task_created' => ':user_name tarafından yeni bir görev oluşturuldu: ":task_name"',
    'task_assigned' => ':assigner_name tarafından size bir görev atandı: ":task_name"',
    'task_completed' => ':user_name görevi tamamladı: ":task_name"',
    'task_updated' => ':user_name görevi güncelledi: ":task_name"',
    'task_deleted' => ':user_name görevi sildi: ":task_name"',
    'task_mentioned' => ':user_name sizi bir görevde bahsetti: ":task_name"',
    'task_due_soon' => '":task_name" görevi yakında sona eriyor',
    'task_overdue' => '":task_name" görevinin süresi geçti',

    // Comment Notifications
    'comment_created' => ':user_name yeni bir yorum ekledi',
    'comment_mentioned' => ':user_name sizi bir yorumda bahsetti',
    'comment_reply' => ':user_name yorumunuza yanıt verdi',

    // Project Notifications
    'project_created' => ':user_name yeni bir proje oluşturdu: ":project_name"',
    'project_updated' => ':user_name projeyi güncelledi: ":project_name"',
    'project_deleted' => ':user_name projeyi sildi: ":project_name"',
    'added_to_project' => ':user_name sizi projeye ekledi: ":project_name"',
    'removed_from_project' => ':user_name sizi projeden çıkardı: ":project_name"',

    // User Notifications
    'user_created' => 'Hoş geldiniz! Hesabınız başarıyla oluşturuldu.',
    'password_changed' => 'Şifreniz başarıyla değiştirildi.',
    'profile_updated' => 'Profiliniz başarıyla güncellendi.',

    // Time Log Notifications
    'time_logged' => ':user_name zaman kaydetti: :minutes dakika',
    'timer_started' => 'Zamanlayıcı başlatıldı',
    'timer_stopped' => 'Zamanlayıcı durduruldu: :minutes dakika',

    // Permission Notifications
    'permission_granted' => 'Size yeni bir izin verildi: :permission_name',
    'permission_revoked' => 'İzniniz kaldırıldı: :permission_name',
    'role_assigned' => 'Size yeni bir rol atandı: :role_name',
    'role_removed' => 'Rolünüz kaldırıldı: :role_name',

    // Reminder Notifications
    'task_reminder' => 'Hatırlatma: ":task_name" görevi :date tarihinde bitiyor',
    'meeting_reminder' => 'Hatırlatma: :time\'de toplantınız var',

    // Email Subjects
    'email_subject_task_assigned' => 'Size yeni bir görev atandı',
    'email_subject_task_mentioned' => 'Bir görevde bahsedildiniz',
    'email_subject_comment_created' => 'Yeni yorum',
    'email_subject_project_invite' => 'Proje davetiyesi',
    'email_subject_password_reset' => 'Şifre sıfırlama talebi',
    'email_subject_welcome' => 'Hoş geldiniz - LaraCollab',

    // Action Buttons
    'view_task' => 'Görevi Görüntüle',
    'view_project' => 'Projeyi Görüntüle',
    'view_comment' => 'Yorumu Görüntüle',
    'view_notification' => 'Bildirimi Görüntüle',
    'mark_as_read' => 'Okundu Olarak İşaretle',

    // Time Ago
    'just_now' => 'Şimdi',
    'minutes_ago' => ':count dakika önce|:count dakika önce',
    'hours_ago' => ':count saat önce|:count saat önce',
    'days_ago' => ':count gün önce|:count gün önce',
    'weeks_ago' => ':count hafta önce|:count hafta önce',
    'months_ago' => ':count ay önce|:count ay önce',
    'years_ago' => ':count yıl önce|:count yıl önce',
];
