# Generated by Django 5.0.4 on 2024-05-13 15:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('enrichmentlist', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='EnrichmentListFiles',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='storage')),
                ('list_id', models.IntegerField()),
                ('created_by', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'enrichment_list_files',
            },
        ),
    ]
