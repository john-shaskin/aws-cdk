#!/bin/bash
set -euo pipefail
scriptdir=$(cd $(dirname $0) && pwd)
source ${scriptdir}/common.bash
# ----------------------------------------------------------

setup

function nonfailing_diff() {
    ( cdk diff $1 2>&1 || true ) | strip_color_codes
}

assert "nonfailing_diff cdk-toolkit-integration-iam-test" <<HERE
IAM Statement Changes
┌───┬─────────────────┬────────┬────────────────┬────────────────────────────┬───────────┐
│   │ Resource        │ Effect │ Action         │ Principal                  │ Condition │
├───┼─────────────────┼────────┼────────────────┼────────────────────────────┼───────────┤
│ + │ \${SomeRole.Arn} │ Allow  │ sts:AssumeRole │ Service:ec2.amazon.aws.com │           │
└───┴─────────────────┴────────┴────────────────┴────────────────────────────┴───────────┘

Resources
[+] AWS::IAM::Role SomeRole SomeRole6DDC54DD

HERE

echo "✅  success"
