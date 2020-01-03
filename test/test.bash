#!/bin/bash

for i in *.js */;
do
    echo "start testing $i"
    node "$i";
    if [ "$?" -ne 0 ];
    then
        echo "$i test failed"
        exit $?
    fi
    echo "$i success"
done

echo "all test pass"
