using System.Text;
using UglyToad.PdfPig;

namespace HireLens.Api.Services;

public class PdfTextExtractor
{
    public string ExtractTextFromPdf(Stream pdfStream)
    {
        // PdfPig needs a seekable stream. We'll copy to MemoryStream.
        using var ms = new MemoryStream();
        pdfStream.CopyTo(ms);
        ms.Position = 0;

        var sb = new StringBuilder();

        using var document = PdfDocument.Open(ms);
        foreach (var page in document.GetPages())
        {
            sb.AppendLine(page.Text);
            sb.AppendLine();
        }

        return sb.ToString();
    }
}