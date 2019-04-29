(module
  (func $log (import "imports" "log") (param i32))

  (func $main
    (call $log
      (i32.add
        (i32.const 2)
        (i32.const 5)
      )
    )
  )

  (start $main)
)