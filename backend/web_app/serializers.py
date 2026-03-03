from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department, Employee, Payment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'head', 'employee_count', 'created_at', 'updated_at']

    def get_employee_count(self, obj):
        return obj.employees.filter(status='active').count()


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'gender', 'department', 'department_name',
            'job_title', 'date_joined', 'status', 'created_at', 'updated_at'
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class PaymentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.__str__', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'employee', 'employee_name', 'employee_id_code',
            'payment_type', 'amount', 'currency', 'payment_date',
            'reference', 'status', 'description', 'created_at', 'updated_at'
        ]