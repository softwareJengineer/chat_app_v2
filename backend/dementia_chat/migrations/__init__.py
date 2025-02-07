from django.db import migrations

def create_data(apps, schema_editor):
    Patient = apps.get_model('patients', 'Patient')
    Patient(name="Joe Silver").save()

class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_data),
    ]