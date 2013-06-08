using System;
using System.Linq;
using System.Collections;
using System.Collections.Generic;

class Variation<T> : IEnumerable<IEnumerable<T>>
{
    private readonly IList<T> elements = null;

    private readonly IList<int> indices = null;

    public Variation(IEnumerable<T> elements)
    {
        this.elements = elements.ToArray();

        this.indices = new int[this.elements.Count];
    }

    private IEnumerable<IEnumerable<T>> Generate(int start)
    {
        if (start == this.indices.Count)
        {
            yield return this.indices.Select(i => this.elements[i]);
        }

        else
        {
            for (int i = 0; i < this.indices.Count; i++)
            {
                this.indices[start] = i;

                foreach (var item in this.Generate(start + 1))
                {
                    yield return item;
                }
            }
        }
    }

    public IEnumerator<IEnumerable<T>> GetEnumerator()
    {
        return this.Generate(0).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return this.GetEnumerator();
    }
}

class Combination<T> : IEnumerable<IEnumerable<T>>
{
    private readonly IList<T> elements = null;

    private readonly IList<int> indices = null;

    private readonly int n = 0;

    public Combination(IEnumerable<T> elements, int n)
    {
        this.elements = elements.ToArray();
        this.n = n;

        this.indices = new int[n];
    }

    private IEnumerable<IEnumerable<T>> Generate(int i, int next)
    {
        //if (i == this.indices.Count)
        //{
        //    yield return this.indices.Select(x => this.elements[x]);
        //}

        //else
        //{
        //    for (int j = next; j < this.elements.Count; j++)
        //    {
        //        this.indices[i] = j;

        //        foreach (var item in this.Generate(i + 1, next + 1))
        //        {
        //            yield return item;
        //        }
        //    }
        //}

        throw new NotImplementedException();
    }

    public IEnumerator<IEnumerable<T>> GetEnumerator()
    {
        return this.Generate(0, 0).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return this.GetEnumerator();
    }
}

class Permutation<T> : IEnumerable<IEnumerable<T>>
{
    private readonly IList<T> elements = null;

    private readonly IList<int> indices = null;

    private readonly IList<bool> used = null;

    public Permutation(IEnumerable<T> elements)
    {
        this.elements = elements.ToArray();

        this.indices = new int[this.elements.Count];
        this.used = new bool[this.elements.Count];
    }

    private IEnumerable<IEnumerable<T>> Generate(int start)
    {
        if (start == this.indices.Count)
        {
            yield return this.indices.Select(i => this.elements[i]);
        }

        else
        {
            for (int i = 0; i < this.indices.Count; i++)
            {
                if (this.used[i]) continue;

                this.indices[start] = i;

                this.used[i] = true;

                foreach (var item in this.Generate(start + 1))
                {
                    yield return item;
                }

                this.used[i] = false;
            }
        }
    }

    public IEnumerator<IEnumerable<T>> GetEnumerator()
    {
        return this.Generate(0).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return this.GetEnumerator();
    }
}

class Program
{
    static void Main()
    {
        var numbers = new[] { "1", "2", "3", "4", "5" };

        //foreach (var item in new Variation<string>(numbers))
        //    Console.WriteLine(string.Join(" ", item));

        foreach (var item in new Combination<string>(numbers, 3))
            Console.WriteLine(string.Join(" ", item));

        //foreach (var item in new Permutation<string>(numbers))
        //    Console.WriteLine(string.Join(" ", item));
    }
}
