from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager
from cloudinary.models import CloudinaryField
from django.core.exceptions import ValidationError

class CustomUser(AbstractUser):
     ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('customer', 'Customer'),
        ('caretaker', 'Caretaker'),
        ('vocational_school', 'Vocational School'),
    ]

     role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
     objects = CustomUserManager()  
     
     def __str__(self):
        return f"{self.username} ({self.role})"
     


class CaretakerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='caretaker_profile')
    name = models.CharField(max_length=255)
    certifications = models.TextField()  
    skills = models.CharField(max_length=255) 
    availability = models.CharField(max_length=255)  
    profile_picture = CloudinaryField('image', null=True, blank=True) 
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    rate_type = models.CharField(max_length=10, choices=[('hour', 'Hour'), ('day', 'Day'), ('week', 'Week')], default='hour')
    number_of_ratings = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    def __str__(self):
        return self.name
    

    def update_average_rating(self):
            reviews = Review.objects.filter(caretaker=self)
            total_rating = sum([review.rating for review in reviews])
            number_of_reviews = reviews.count()
            if number_of_reviews > 0:
                average = total_rating / number_of_reviews
                self.average_rating = round(min(5, max(1, average)), 2)  
            else:
                self.average_rating = 0
            self.save()    

class Review(models.Model):
    caretaker = models.ForeignKey(CaretakerProfile, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField()
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['caretaker', 'user']

    def save(self, *args, **kwargs):
        if self.rating < 1 or self.rating > 5:
            raise ValidationError("Rating must be between 1 and 5.")

        is_new_review = not self.pk

        super().save(*args, **kwargs)  

        if is_new_review:
            self.caretaker.number_of_ratings += 1
            self.caretaker.update_average_rating()  
            self.caretaker.save() 

    def delete(self, *args, **kwargs):
        self.caretaker.number_of_ratings -= 1
        self.caretaker.update_average_rating()  
        self.caretaker.save()  
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Review for {self.caretaker}: {self.rating} stars"

class Message(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="received_messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver}"

class Reply(models.Model):
    message = models.ForeignKey(Message, related_name="replies", on_delete=models.CASCADE)
    sender = models.ForeignKey(CustomUser, related_name="sent_replies", on_delete=models.CASCADE)
    receiver = models.ForeignKey(CustomUser, related_name="received_replies", on_delete=models.CASCADE, null=True, blank=True)  # Allow null values
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    reply_to = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="replies")

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.content[:20]}"
    
class JobPost(models.Model):
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="posted_jobs")
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    required_skills = models.TextField()
    pay_rate = models.DecimalField(max_digits=10, decimal_places=2)
    rate_type = models.CharField(max_length=10, choices=[('hour', 'Hour'), ('day', 'Day'), ('week', 'Week')], default='hour')
    duration = models.CharField(max_length=100)  
    status = models.CharField(
        max_length=20,
        choices=[("Open", "Open"), ("Closed", "Closed"), ("In Progress", "In Progress")],
        default="Open",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class JobApplication(models.Model):
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="applications")
    caretaker = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[("Pending", "Pending"), ("Accepted", "Accepted"), ("Rejected", "Rejected")],
        default="Pending",
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.caretaker.username} applied to {self.job.title}"

class VocationalSchool(models.Model):
    manager = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="school")  
    name = models.CharField(max_length=255)
    logo = CloudinaryField('image', null=True, blank=True,)
    description = models.TextField()
    location = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name

class Course(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]

    school = models.ForeignKey(VocationalSchool, on_delete=models.CASCADE, related_name="courses")
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.IntegerField(default=0)
    duration = models.CharField(max_length=50)  
    certification_approved = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open') 


    def __str__(self):
        return self.title

class Enrollment(models.Model):
    caretaker = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    approved = models.BooleanField(default=False)

    class Meta:
        unique_together = ('caretaker', 'course')

