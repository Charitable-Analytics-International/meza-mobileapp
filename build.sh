#!/bin/bash

npm run build &&
npx cap sync && 
# npx cap copy &&
npx cap run android
