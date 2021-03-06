import { Construct, Lazy, PhysicalName, Resource, ResourceIdentifiers, Stack } from '@aws-cdk/cdk';
import { CfnGroup } from './iam.generated';
import { IIdentity } from './identity-base';
import { IManagedPolicy } from './managed-policy';
import { Policy } from './policy';
import { PolicyStatement } from './policy-statement';
import { ArnPrincipal, IPrincipal, PrincipalPolicyFragment } from './principals';
import { IUser } from './user';
import { AttachedPolicies } from './util';

export interface IGroup extends IIdentity {
  /**
   * Returns the IAM Group Name
   *
   * @attribute
   */
  readonly groupName: string;

  /**
   * Returns the IAM Group ARN
   *
   * @attribute
   */
  readonly groupArn: string;
}

export interface GroupProps {
  /**
   * A name for the IAM group. For valid values, see the GroupName parameter
   * for the CreateGroup action in the IAM API Reference. If you don't specify
   * a name, AWS CloudFormation generates a unique physical ID and uses that
   * ID for the group name.
   *
   * If you specify a name, you must specify the CAPABILITY_NAMED_IAM value to
   * acknowledge your template's capabilities. For more information, see
   * Acknowledging IAM Resources in AWS CloudFormation Templates.
   *
   * @default Generated by CloudFormation (recommended)
   */
  readonly groupName?: PhysicalName;

  /**
   * A list of ARNs for managed policies associated with group.
   *
   * @default - No managed policies.
   */
  readonly managedPolicyArns?: any[];

  /**
   * The path to the group. For more information about paths, see [IAM
   * Identifiers](http://docs.aws.amazon.com/IAM/latest/UserGuide/index.html?Using_Identifiers.html)
   * in the IAM User Guide.
   *
   * @default /
   */
  readonly path?: string;
}

abstract class GroupBase extends Resource implements IGroup {
  public abstract readonly groupName: string;
  public abstract readonly groupArn: string;

  public readonly grantPrincipal: IPrincipal = this;
  public readonly assumeRoleAction: string = 'sts:AssumeRole';

  private readonly attachedPolicies = new AttachedPolicies();
  private defaultPolicy?: Policy;

  public get policyFragment(): PrincipalPolicyFragment {
    return new ArnPrincipal(this.groupArn).policyFragment;
  }

  /**
   * Attaches a policy to this group.
   * @param policy The policy to attach.
   */
  public attachInlinePolicy(policy: Policy) {
    this.attachedPolicies.attach(policy);
    policy.attachToGroup(this);
  }

  public addManagedPolicy(_policy: IManagedPolicy) {
    // drop
  }

  /**
   * Adds a user to this group.
   */
  public addUser(user: IUser) {
    user.addToGroup(this);
  }

  /**
   * Adds an IAM statement to the default policy.
   */
  public addToPolicy(statement: PolicyStatement): boolean {
    if (!this.defaultPolicy) {
      this.defaultPolicy = new Policy(this, 'DefaultPolicy');
      this.defaultPolicy.attachToGroup(this);
    }

    this.defaultPolicy.addStatements(statement);
    return true;
  }
}

export class Group extends GroupBase {

  /**
   * Imports a group from ARN
   * @param groupArn (e.g. `arn:aws:iam::account-id:group/group-name`)
   */
  public static fromGroupArn(scope: Construct, id: string, groupArn: string): IGroup {
    const groupName = Stack.of(scope).parseArn(groupArn).resourceName!;
    class Import extends GroupBase {
      public groupName = groupName;
      public groupArn = groupArn;
    }

    return new Import(scope, id);
  }

  public readonly groupName: string;
  public readonly groupArn: string;

  private readonly managedPolicies: IManagedPolicy[] = [];

  constructor(scope: Construct, id: string, props: GroupProps = {}) {
    super(scope, id, {
      physicalName: props.groupName,
    });

    this.managedPolicies.push(...props.managedPolicyArns || []);

    const group = new CfnGroup(this, 'Resource', {
      groupName: this.physicalName.value,
      managedPolicyArns: Lazy.listValue({ produce: () => this.managedPolicies.map(p => p.managedPolicyArn) }, { omitEmpty: true }),
      path: props.path,
    });

    const resourceIdentifiers = new ResourceIdentifiers(this, {
      arn: group.attrArn,
      name: group.refAsString,
      arnComponents: {
        region: '', // IAM is global in each partition
        service: 'iam',
        resource: 'group',
        resourceName: this.physicalName.value,
      },
    });
    this.groupName = resourceIdentifiers.name;
    this.groupArn = resourceIdentifiers.arn;
  }

  /**
   * Attaches a managed policy to this group.
   * @param policy The managed policy to attach.
   */
  public addManagedPolicy(policy: IManagedPolicy) {
    this.managedPolicies.push(policy);
  }
}
