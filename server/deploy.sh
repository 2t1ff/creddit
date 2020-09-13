#!/bin/bash

echo What should the version be?
read VERSION

docker build -t 2t1ff/creddit:$VERSION .