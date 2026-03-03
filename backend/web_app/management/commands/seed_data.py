from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from web_app.models import Department, Employee, Payment
from datetime import date, timedelta
import random
import uuid


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        # Create superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@safaricom.co.ke', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created admin user: admin / admin123'))

        # Departments
        depts_data = [
            {'name': 'Engineering', 'code': 'ENG', 'head': 'John Kariuki', 'description': 'Software and Network Engineering'},
            {'name': 'Finance', 'code': 'FIN', 'head': 'Mary Wanjiku', 'description': 'Financial Planning and Accounting'},
            {'name': 'Human Resources', 'code': 'HR', 'head': 'Peter Mwangi', 'description': 'People and Culture'},
            {'name': 'Customer Experience', 'code': 'CX', 'head': 'Grace Achieng', 'description': 'Customer Support and Success'},
            {'name': 'Sales & Marketing', 'code': 'SM', 'head': 'David Otieno', 'description': 'Revenue and Growth'},
            {'name': 'Legal & Compliance', 'code': 'LC', 'head': 'Amina Hassan', 'description': 'Legal Affairs and Regulatory Compliance'},
        ]

        depts = []
        for d in depts_data:
            dept, _ = Department.objects.get_or_create(code=d['code'], defaults=d)
            depts.append(dept)
        self.stdout.write(self.style.SUCCESS(f'Created {len(depts)} departments'))

        # Employees
        first_names = ['James', 'Mary', 'John', 'Grace', 'Peter', 'Faith', 'David', 'Esther', 'Paul', 'Ruth',
                       'Samuel', 'Naomi', 'Michael', 'Lydia', 'Daniel', 'Priscilla', 'Joseph', 'Hannah', 'Moses', 'Deborah']
        last_names = ['Kariuki', 'Wanjiku', 'Otieno', 'Achieng', 'Mwangi', 'Njeri', 'Kamau', 'Wambua',
                      'Omondi', 'Nyambura', 'Kiprotich', 'Chebet', 'Mutua', 'Nduta', 'Odhiambo', 'Adhiambo']
        titles = ['Software Engineer', 'Senior Analyst', 'Manager', 'Team Lead', 'Specialist', 'Coordinator', 'Director', 'Associate']

        for i in range(1, 31):
            emp_id = f'SAF{str(i).zfill(4)}'
            if not Employee.objects.filter(employee_id=emp_id).exists():
                fn = random.choice(first_names)
                ln = random.choice(last_names)
                Employee.objects.create(
                    employee_id=emp_id,
                    first_name=fn,
                    last_name=ln,
                    email=f'{fn.lower()}.{ln.lower()}{i}@safaricom.co.ke',
                    phone=f'+2547{random.randint(10000000, 99999999)}',
                    gender=random.choice(['M', 'F']),
                    department=random.choice(depts),
                    job_title=random.choice(titles),
                    date_joined=date.today() - timedelta(days=random.randint(30, 1500)),
                    status=random.choice(['active', 'active', 'active', 'inactive']),
                )

        employees = list(Employee.objects.all())
        self.stdout.write(self.style.SUCCESS(f'Created {len(employees)} employees'))

        # Payments
        payment_types = ['salary', 'bonus', 'allowance', 'deduction']
        statuses = ['processed', 'processed', 'pending', 'failed']

        for i in range(1, 51):
            ref = f'PAY-{uuid.uuid4().hex[:8].upper()}'
            if not Payment.objects.filter(reference=ref).exists():
                Payment.objects.create(
                    employee=random.choice(employees),
                    payment_type=random.choice(payment_types),
                    amount=random.choice([45000, 65000, 80000, 120000, 150000, 200000, 15000, 8000, 5000]),
                    currency='KES',
                    payment_date=date.today() - timedelta(days=random.randint(0, 90)),
                    reference=ref,
                    status=random.choice(statuses),
                    description='Monthly payroll processing',
                )

        self.stdout.write(self.style.SUCCESS(f'Created payments'))
        self.stdout.write(self.style.SUCCESS('✅ Seeding complete! Login: admin / admin123'))