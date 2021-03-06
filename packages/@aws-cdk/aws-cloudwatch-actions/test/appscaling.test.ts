import '@aws-cdk/assert/jest';
import appscaling = require('@aws-cdk/aws-applicationautoscaling');
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import { Stack } from '@aws-cdk/cdk';
import actions = require('../lib');

test('can use topic as alarm action', () => {
  // GIVEN
  const stack = new Stack();
  const scalingTarget = new appscaling.ScalableTarget(stack, 'Target', {
    minCapacity: 1,
    maxCapacity: 100,
    resourceId: 'asdf',
    scalableDimension: 'height',
    serviceNamespace: appscaling.ServiceNamespace.CustomResource,
  });
  const action = new appscaling.StepScalingAction(stack, 'Action', {
    scalingTarget,
  });
  const alarm = new cloudwatch.Alarm(stack, 'Alarm', {
    metric: new cloudwatch.Metric({ namespace: 'AWS', metricName: 'Henk' }),
    evaluationPeriods: 3,
    threshold: 100
  });

  // WHEN
  alarm.addAlarmAction(new actions.ApplicationScalingAction(action));

  // THEN
  expect(stack).toHaveResource('AWS::CloudWatch::Alarm', {
    AlarmActions: [
      { Ref: "Action62AD07C0" }
    ],
  });
});