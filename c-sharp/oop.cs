using System;

static class Program
{
    // Base properties
    static string PersonGetFirstName(string[][] @this)
    {
        return @this[0][0];
    }

    static void PersonSetFirstName(string[][] @this, string firstName)
    {
        @this[0][0] = firstName;
    }

    static string PersonGetMiddleName(string[][] @this)
    {
        return @this[0][1];
    }

    static void PersonSetMiddleName(string[][] @this, string middleName)
    {
        @this[0][1] = middleName;
    }

    static string PersonGetLastName(string[][] @this)
    {
        return @this[0][2];
    }

    static void PersonSetLastName(string[][] @this, string lastName)
    {
        @this[0][2] = lastName;
    }

    // Base constructor
    static string[][] PersonConstructor(string firstName, string middleName, string lastName)
    {
        var @this = new string[1][];

        @this[0] = new string[3];

        PersonSetFirstName(@this, firstName);
        PersonSetMiddleName(@this, middleName);
        PersonSetLastName(@this, lastName);

        return @this;
    }

    // Base methods
    static int PersonGetNameLength(string[][] _this)
    {
        return PersonToString(_this).Length;
    }

    static string PersonToString(string[][] @this)
    {
        return String.Format("Name: {0} {1} {2};",
            PersonGetFirstName(@this), PersonGetMiddleName(@this), PersonGetLastName(@this));
    }

    // Child properties
    static string StudentGetUniversity(string[][] @this)
    {
        return @this[1][0];
    }


    static void StudentSetUniversity(string[][] @this, string university)
    {
        @this[1][0] = university;
    }

    static string StudentGetFaculty(string[][] @this)
    {
        return @this[1][1];
    }


    static void StudentSetFaculty(string[][] @this, string faculty)
    {
        @this[1][1] = faculty;
    }

    // Child constructor
    static string[][] StudentConstructor(string firstName, string middleName, string lastName, string university, string faculty)
    {
        var @base = PersonConstructor(firstName, middleName, lastName); // Inheritance
        var @this = new string[2][];

        @this[0] = @base[0];
        @this[1] = new string[2];

        StudentSetUniversity(@this, university);
        StudentSetFaculty(@this, faculty);

        return @this;
    }

    // Child methods
    static string StudentToString(string[][] @this)
    {
        var @base = new string[][] { @this[0] };

        return String.Format("{0} University: {1}; Faculty: {2};",
            PersonToString(@base), StudentGetUniversity(@this), StudentGetFaculty(@this));
    }

    static void Main()
    {
        var person = PersonConstructor("Pesho", "Georgiev", "Nakov");
        var student = StudentConstructor("Svetlin", "Ivanov", "Nakov", "SU", "FMI");

        Console.WriteLine(PersonToString(person));
        Console.WriteLine(StudentToString(student));

        // Polymorphism
        PersonSetFirstName(person, "Gosho");
        PersonSetFirstName(student, "Ivan");

        Console.WriteLine(PersonGetNameLength(person));
        Console.WriteLine(PersonGetNameLength(student));

        Console.WriteLine(PersonToString(person));
        Console.WriteLine(StudentToString(student)); // override modifier
        Console.WriteLine(PersonToString(student));  // new modifier
    }
}
