import { Construct, Lazy, PhysicalName, Resource, Stack } from "@aws-cdk/cdk";
import { CfnDashboard } from './cloudwatch.generated';
import { Column, Row } from "./layout";
import { IWidget } from "./widget";

export enum PeriodOverride {
  Auto = 'auto',
  Inherit = 'inherit',
}

export interface DashboardProps {
  /**
   * Name of the dashboard
   *
   * @default Automatically generated name
   */
  readonly dashboardName?: PhysicalName;

  /**
   * The start of the time range to use for each widget on the dashboard.
   * You can specify start without specifying end to specify a relative time range that ends with the current time.
   * In this case, the value of start must begin with -P, and you can use M, H, D, W and M as abbreviations for
   * minutes, hours, days, weeks and months. For example, -PT8H shows the last 8 hours and -P3M shows the last three months.
   * You can also use start along with an end field, to specify an absolute time range.
   * When specifying an absolute time range, use the ISO 8601 format. For example, 2018-12-17T06:00:00.000Z.
   *
   * @default When the dashboard loads, the start time will be the default time range.
   */
  readonly start?: string;

  /**
   * The end of the time range to use for each widget on the dashboard when the dashboard loads.
   * If you specify a value for end, you must also specify a value for start.
   * Specify an absolute time in the ISO 8601 format. For example, 2018-12-17T06:00:00.000Z.
   *
   * @default When the dashboard loads, the end date will be the current time.
   */
  readonly end?: string;

  /**
   * Use this field to specify the period for the graphs when the dashboard loads.
   * Specifying `Auto` causes the period of all graphs on the dashboard to automatically adapt to the time range of the dashboard.
   * Specifying `Inherit` ensures that the period set for each graph is always obeyed.
   *
   * @default Auto
   */
  readonly periodOverride?: PeriodOverride;

  /**
   * Initial set of widgets on the dashboard
   *
   * One array represents a row of widgets.
   *
   * @default - No widgets
   */
  readonly widgets?: IWidget[][]
}

/**
 * A CloudWatch dashboard
 */
export class Dashboard extends Resource {
  private readonly rows: IWidget[] = [];

  constructor(scope: Construct, id: string, props: DashboardProps = {}) {
    super(scope, id, {
      physicalName: props.dashboardName,
    });

    new CfnDashboard(this, 'Resource', {
      dashboardName: this.physicalName.value,
      dashboardBody: Lazy.stringValue({ produce: () => {
        const column = new Column(...this.rows);
        column.position(0, 0);
        return Stack.of(this).toJsonString({
          start: props.start,
          end: props.end,
          periodOverride: props.periodOverride,
          widgets: column.toJson(),
        });
      }})
    });

    (props.widgets || []).forEach(row => {
      this.addWidgets(...row);
    });
  }

  /**
   * Add a widget to the dashboard.
   *
   * Widgets given in multiple calls to add() will be laid out stacked on
   * top of each other.
   *
   * Multiple widgets added in the same call to add() will be laid out next
   * to each other.
   */
  public addWidgets(...widgets: IWidget[]) {
    if (widgets.length === 0) {
      return;
    }

    const w = widgets.length > 1 ? new Row(...widgets) : widgets[0];
    this.rows.push(w);
  }
}
