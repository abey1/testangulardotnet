namespace Test.Api.Models;

public class User
{
    public Guid Id { get; set; }

    public string Email { get; set; }

    public byte[] PasswordHash { get; set; }

    public byte[] PasswordSalt { get; set; }

    public string Roll { get; set; }

}

public class JwtOnly
{
    public string Jwt { get; set; }
}

public class FirstRegisterDto
{
    public Guid Id { get; set; }
    public string Jwt { get; set; }

}

public class AllUsersDto
{
    public List<UserEmailRoll> UserEmailRolls { get; set; }

    public string Jwt { get; set; }
}

public class UserDeleteDto
{
    public Guid AdminId { get; set; }
    public Guid UserId { get; set; }
    public string Jwt { get; set; }
}

public class UserEmailDto
{
    public string Email { get; set; }

    public string Password { get; set; }
}

public class UserEmailRoll
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string Roll { get; set; }
}

public class UserJwtDto
{
    public Guid Id { get; set; }
    public string Jwt { get; set; }
}

public class UserPasswordResetDto
{
    public string Email { get; set; }

    public string OldPassword { get; set; }

    public string Password { get; set; }

    public string Jwt { get; set; }
}

public class UserRollChangeDto
{
    public Guid Id { get; set; }

    public string Roll { get; set; }

    public string Jwt { get; set; }
}

public class UserRollJwt
{
    public Guid Id { get; set; }
    public string Roll { get; set; }

    public string Jwt { get; set; }
}


public class ErrorDto
{
    public string StatusText { get; set; }
}