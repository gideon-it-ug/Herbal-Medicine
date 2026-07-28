from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('repository', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='plant',
            old_name='ailments_treated',
            new_name='disease_cured',
        ),
    ]
