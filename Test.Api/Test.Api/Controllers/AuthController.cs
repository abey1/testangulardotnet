using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Test.Api.Data;
using Test.Api.Models;

namespace Test.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController: ControllerBase
    {
        //constants
        private const string TOKEN_EXPIRED = "Token expired.";
        private const string USER_NOT_FOUND = "User not found.";
        private const string WRONG_PASSWORD = "Wrong password.";
        private const string ADMIN = "admin";
        private const string YOU_ARE_ALREADY_REGISTERED = "you have already registered, please login";
        private const string OLD_PASSWORD_NOT_CORRECT = "your old password is not correct";
        //user context
        private readonly UserContext _userContext;

        // configuration
        private readonly IConfiguration _configuration;

        //constructor
        public AuthController(UserContext userContext, IConfiguration configuration)
        {
            _userContext = userContext;
            _configuration = configuration;
        }

        // get all users
        [HttpPost("get-all-user")]

        public async Task<ActionResult<UserEmailRoll[]>> GetAllUsers([FromBody] UserJwtDto userJwtDto)
        {
            if (jwtExpired(userJwtDto.Jwt))
            {
                ErrorDto errorDto = new()
                {
                    StatusText = TOKEN_EXPIRED
                };
                return Unauthorized(errorDto);
            }
            else
            {
                //get admin from database where email
                var adminUser = await _userContext.Users.FirstOrDefaultAsync(x => x.Id == userJwtDto.Id);

                if(adminUser.Roll == ADMIN)
                {
                    //get all users from database
                    //var users = await _userContext.Users.ToListAsync();
                    var users = await _userContext.Users.Where(x => x.Id != userJwtDto.Id).ToListAsync();
                    
                    //declair userEmailRolls
                    var  userEmailRolls = new List<UserEmailRoll>();
            
                    //take out necessary columns from users and assign to
                    //userEmailRolls
                    users.ForEach(u =>
                    {
                        userEmailRolls.Add(
                            new UserEmailRoll()
                            {
                                Id = u.Id,
                                Email = u.Email,
                                Roll = u.Roll
                            });
                    });

                    var allUsersDto = new AllUsersDto();

                    allUsersDto.UserEmailRolls = userEmailRolls;

                    string token = CreateToken(adminUser);

                    allUsersDto.Jwt = token;

                    return Ok(allUsersDto);
                }
                else
                {
                    ErrorDto errorDto = new()
                    {
                        StatusText = "you are not admin user"
                    };

                    return BadRequest(errorDto);
                }

                
            }
        }

        //register
        [HttpPost("register")]
        public async Task<IActionResult> AddUser([FromBody] UserEmailDto userDto)
        {
            //create user
            User userRequest = new User();

            // get user email 
            userRequest.Email = userDto.Email;

            // check if user is in database
            var user = await _userContext.Users.FirstOrDefaultAsync(x => x.Email == userDto.Email);

            if(user == null)
            {
                // assign Guid 
                userRequest.Id = Guid.NewGuid();


                CreatePasswordHash(userDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

                userRequest.PasswordHash = passwordHash;
                userRequest.PasswordSalt = passwordSalt;

                string jwt = CreateToken(userRequest);

                await _userContext.Users.AddAsync(userRequest);
                await _userContext.SaveChangesAsync();

                FirstRegisterDto firstRegisterDto = new FirstRegisterDto();
                firstRegisterDto.Id = userRequest.Id;
                firstRegisterDto.Jwt = jwt;

                return Ok(firstRegisterDto);
            }
            else
            {
                ErrorDto errorDto = new()
                {
                    StatusText = YOU_ARE_ALREADY_REGISTERED
                };
                return BadRequest(errorDto);
            }



        }

        //password hash

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        //create jwt token
        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, "Admin")
            };

            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }


        //login
        [HttpPost("login")]
        public async Task<ActionResult<UserRollJwt>> Login([FromBody] UserEmailDto userDto)
        {
            //get user from database where email
            var user = await _userContext.Users.FirstOrDefaultAsync(x => x.Email == userDto.Email);

            if (user == null)
            {
                ErrorDto error = new()
                {
                    StatusText = USER_NOT_FOUND
                };
                return BadRequest(error);
            }

            if (!VerifyPasswordHash(userDto.Password, user.PasswordHash, user.PasswordSalt))
            {
                ErrorDto error = new()
                {
                    StatusText = WRONG_PASSWORD
                };
                return BadRequest(error);
            }

            string token = CreateToken(user);
            var userRollJwt = new UserRollJwt();

            userRollJwt.Id = user.Id;
            userRollJwt.Roll = user.Roll;
            userRollJwt.Jwt = token;

            return Ok(userRollJwt);
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(passwordHash);
            }
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<string>> ResetPassword([FromBody] UserPasswordResetDto userPasswordResetDto)
        {   
            // get user from database
            var existingUser = await _userContext.Users.FirstOrDefaultAsync(x => x.Email == userPasswordResetDto.Email);

            if (jwtExpired(userPasswordResetDto.Jwt))
            {
                ErrorDto errorDto = new()
                {
                    StatusText = TOKEN_EXPIRED
                };
                return Unauthorized(errorDto);
            }
            else if (!VerifyPasswordHash(userPasswordResetDto.OldPassword, existingUser.PasswordHash, existingUser.PasswordSalt))
            {
                return BadRequest(OLD_PASSWORD_NOT_CORRECT);
            }else
            {
                
                if(existingUser == null)
                {
                    return BadRequest(USER_NOT_FOUND);
                }
                else {
                    CreatePasswordHash(userPasswordResetDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

                    existingUser.PasswordHash = passwordHash;
                    existingUser.PasswordSalt = passwordSalt;

                    await _userContext.SaveChangesAsync();
                    string token = CreateToken(existingUser);
                    JwtOnly jwtOnly = new()
                    {
                        Jwt = token
                    };
                    return Ok(jwtOnly);
                }
            }
        }

        private bool jwtExpired(string jwt)
        {
            if (jwt == "")
            {
                //token empty
                return true;
            }
            else
            {
                var jT = new JwtSecurityTokenHandler().ReadToken(jwt);

                if ((jT.ValidTo < DateTime.UtcNow))
                {
                    //token expired
                    return true;
                }
                else
                {
                    //token valid and not expired
                    return false;

                }
            }
        }

        [HttpPost("add-roll")]
        public async Task<ActionResult<string>> AddRoll([FromBody] UserRollChangeDto userRollChangeDto)
        {
            if (jwtExpired(userRollChangeDto.Jwt))
            {
                ErrorDto errorDto = new()
                {
                    StatusText=TOKEN_EXPIRED
                };
                return Unauthorized(errorDto);
            }
            else
            {
                var existingUser = await _userContext.Users.FirstOrDefaultAsync(x => x.Id == userRollChangeDto.Id);

                existingUser.Roll = userRollChangeDto.Roll;

                await _userContext.SaveChangesAsync();
                string token = CreateToken(existingUser);

                JwtOnly jwtOnly = new()
                {
                    Jwt = token
                };

                return Ok(jwtOnly);
            }
        }

        [HttpPost("delete")]
        public async Task<ActionResult<string>> DeleteUser([FromBody] UserDeleteDto userDeleteDto)
        {

            if (jwtExpired(userDeleteDto.Jwt))
            {
                ErrorDto errorDto = new()
                {
                    StatusText = TOKEN_EXPIRED
                };
                return Unauthorized(errorDto);
            }
            else
            {
                //get user
                var existingUser = await _userContext.Users.FirstOrDefaultAsync(x => x.Id == userDeleteDto.UserId);
                if (existingUser != null)
                {
                    _userContext.Remove(existingUser);
                    await _userContext.SaveChangesAsync();
                }
                //get admin
                var adminUser = await _userContext.Users.FirstOrDefaultAsync(x => x.Id == userDeleteDto.AdminId);

                string token = CreateToken(adminUser);
                JwtOnly jwtOnly = new()
                {
                    Jwt=token
                };
                return Ok(jwtOnly);
            }

        }
    }
}
