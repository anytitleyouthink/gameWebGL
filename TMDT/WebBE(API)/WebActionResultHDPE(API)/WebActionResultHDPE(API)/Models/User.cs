using System;
using System.Collections.Generic;

namespace WebActionResultHDPE.Models;

public partial class User
{
    public int Id { get; set; }

    public string UserName { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public DateOnly? Birthday { get; set; }

    public int Status { get; set; }

    public string? Notes { get; set; }
}
