using Microsoft.EntityFrameworkCore;
using Test.Api.Models;

namespace Test.Api.Data
{
    public class UserContext : DbContext
    {
        public UserContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
    }
}
