using System;
using System.Text;

class ConsoleRenderer : IRenderer
{
    public const char Empty = '\0';

    private readonly char[,] context = null;
    private readonly char[,] previousContext = null;

    private readonly ConsoleColor[,] contextColor = null;
    private readonly ConsoleColor[,] previousContextColor = null;

    // Default for the enumeration and the console background
    private ConsoleColor currentConsoleColor = ConsoleColor.Black;

    public int Rows { get; private set; }
    public int Cols { get; private set; }

    public ConsoleRenderer(int rows, int cols)
    {
        this.Rows = rows;
        this.Cols = cols;

        this.context = new char[this.Rows, this.Cols];
        this.previousContext = new char[this.Rows, this.Cols];

        this.contextColor = new ConsoleColor[this.Rows, this.Cols];
        this.previousContextColor = new ConsoleColor[this.Rows, this.Cols];

        // Remove scrollbars and cursor
        // If using KeyboardUserInterface use Console.ReadKey(true) to hide the input
        Console.SetWindowSize(this.Cols, this.Rows);
        Console.SetBufferSize(this.Cols, this.Rows);

        Console.CursorVisible = false;
    }

    public void Add(IDrawable obj)
    {
        Coordinates first = new Coordinates(
            Math.Max(obj.Position.Row, 0),
            Math.Max(obj.Position.Col, 0)
        );

        Coordinates last = new Coordinates(
            Math.Min(obj.Position.Row + obj.Rows, this.Rows),
            Math.Min(obj.Position.Col + obj.Cols, this.Cols)
        );

        for (int row = first.Row; row < last.Row; row++)
        {
            for (int col = first.Col; col < last.Col; col++)
            {
                if (obj[row - first.Row, col - first.Col] != ConsoleRenderer.Empty)
                {
                    this.context[row, col] = obj[row - first.Row, col - first.Col];
                    this.contextColor[row, col] = (ConsoleColor)obj.Color;
                }
            }
        }
    }

    private void ChangeColor(ConsoleColor color)
    {
        if (color != this.currentConsoleColor)
        {
            this.currentConsoleColor = color;
            Console.ForegroundColor = this.currentConsoleColor;
        }
    }

    // Single color
    private void RenderAt(StringBuilder image, Coordinates position)
    {
        if (image.Length != 0)
        {
            ChangeColor(this.contextColor[position.Row, position.Col - image.Length]);

            Console.SetCursorPosition(position.Col - image.Length, position.Row); // Reversed
            Console.Write(image);

            image.Clear(); // Side effect
        }
    }

    private bool IsDirty(Coordinates position)
    {
        if (this.context[position.Row, position.Col] != this.previousContext[position.Row, position.Col])
            return true;

        if (this.contextColor[position.Row, position.Col] != this.previousContextColor[position.Row, position.Col])
            return true;

        return false;
    }

    // Console.WriteLine is never used
    // The text wraps automatically on a new row
    private void Render()
    {
        StringBuilder scene = new StringBuilder();

        for (int row = 0; row < this.Rows; row++)
        {
            for (int col = 0; col < this.Cols; col++)
            {
                if (IsDirty(new Coordinates(row, col)))
                {
                    // Color changed, flush buffer
                    if (this.currentConsoleColor != this.contextColor[row, col])
                        RenderAt(scene, new Coordinates(row, col));

                    scene.Append(this.context[row, col]);

                    this.previousContext[row, col] = this.context[row, col];
                    this.previousContextColor[row, col] = this.contextColor[row, col];
                }

                else RenderAt(scene, new Coordinates(row, col)); // Diry section ends, flush buffer
            }

            RenderAt(scene, new Coordinates(row, this.Cols)); // Row ends, flush buffer
        }
    }

    public void Clear()
    {
        for (int row = 0; row < this.Rows; row++)
            for (int col = 0; col < this.Cols; col++)
                this.context[row, col] = ConsoleRenderer.Empty;
    }

    public void RenderAll()
    {
        this.Render();

        this.Clear();
    }
}
