from django.db import migrations, models


def copy_processed_timestamps(apps, schema_editor):
    Transcription = apps.get_model('transcription', 'Transcription')

    for transcription in Transcription.objects.exclude(is_processed__isnull=True):
        transcription.processed_at = transcription.is_processed
        transcription.save(update_fields=['processed_at'])


def sync_processed_flags(apps, schema_editor):
    Transcription = apps.get_model('transcription', 'Transcription')

    for transcription in Transcription.objects.all():
        transcription.is_processed_flag = bool(
            transcription.processed_at or transcription.transcribed_text
        )
        transcription.save(update_fields=['is_processed_flag'])


class Migration(migrations.Migration):

    dependencies = [
        ('transcription', '0002_alter_transcription_audio_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='transcription',
            name='processed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(copy_processed_timestamps, migrations.RunPython.noop),
        migrations.AddField(
            model_name='transcription',
            name='is_processed_flag',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(sync_processed_flags, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='transcription',
            name='language',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.RemoveField(
            model_name='transcription',
            name='is_processed',
        ),
        migrations.RenameField(
            model_name='transcription',
            old_name='is_processed_flag',
            new_name='is_processed',
        ),
    ]
