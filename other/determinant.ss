(define (deleteCell l n)
    (define (deleteCell-i l n i)
        (cond
            ((null? l)
                (list)
            ) ((= i n)
                (deleteCell-i (cdr l) n (+ i 1))
            ) (else
                (cons (car l) (deleteCell-i (cdr l) n (+ i 1)))
            )
        )
    )
    (deleteCell-i l n 0)
)

(define (getCell l n)
    (define (getCell-i l n i)
        (if (= i n)
            (if (null? l)
                (list)
                (car l)
            )
            (getCell-i (cdr l) n (+ i 1))
        )
    )
    (getCell-i l n 0)
)

(define (deleteRow l n)
    (define (deleteRow-i l n i)
        (cond
            ((null? l)
                (list)
            ) ((= i n)
                (deleteRow-i (cdr l) n (+ i 1))
            ) (else
                (cons (car l) (deleteRow-i (cdr l) n (+ i 1)))
            )
        )
    )
    (deleteRow-i l n 0)
)

(define (deleteCol l n)
    (define (deleteCol-i l n i)
        (if (null? l)
            (list)
            (cons (deleteCell (car l) n) (deleteCol-i (cdr l) n (+ i 1)))
        )
    )
    (deleteCol-i l n 0)
)

(define (powMinusOne n)
    (if (even? n)
        1
        -1
    )
)

(define (determinant l)
    (define (determinant-i l i result)
        (if (null? (getCell l i))
            result
            (determinant-i l (+ i 1)
                (+
                    result
                    (*
                        (powMinusOne i)
                        (getCell (car l) i)
                        (determinant (deleteRow (deleteCol l i) 0))
                    )
                )
            )
        )
    )
    (cond
        ((null? (cdr l))
            (caar l)
        ) ((null? (cddr l))
            (- (* (caar l) (cadadr l)) (* (cadar l) (caadr l)))
        ) (else
            (determinant-i l 0 0)
        )
    )
)

(define l
    (list (list 1 2 3 4) (list -5 6 7 8) (list 9 10 11 12) (list 13 -14 15 16))
)

(determinant l)