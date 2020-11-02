from django.db import models
from django.db import IntegrityError

# Create your models here.


class UserObject(models.Model):
    user_token = models.CharField(
        max_length=6, editable=False, unique=True , primary_key = True)

    def save(self, *args, **kwargs):
        if not self.user_token:
            import uuid
            self.user_token = uuid.uuid4().hex[:6].upper()
        success = False
        failures = 0
        while not success:
            try:
                super(UserObject, self).save(*args, **kwargs)
            except IntegrityError:
                failures += 1
                if failures > 5:
                    raise
                else:
                    self.user_token = uuid.uuid4().hex[:6].upper()
            else:
                success = True
    def __str__(self):
    	return self.user_token
