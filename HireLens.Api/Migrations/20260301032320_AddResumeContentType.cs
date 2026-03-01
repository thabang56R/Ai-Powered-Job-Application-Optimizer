using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HireLens.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddResumeContentType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "Resumes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "Resumes");
        }
    }
}
