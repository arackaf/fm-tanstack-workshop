import {
  bodyCompositionLengthUnit,
  bodyCompositionMeasurement,
  bodyCompositionMeasurementType,
  bodyCompositionMetric,
  bodyCompositionWeightUnit,
} from "@/drizzle/schema";

export type BodyCompositionMetric =
  typeof bodyCompositionMetric.$inferInsert & {
    id?: number;
  };
export type ExistingBodyCompositionMetric =
  typeof bodyCompositionMetric.$inferSelect;

export type BodyCompositionMeasurement =
  typeof bodyCompositionMeasurement.$inferInsert;
export type ExistingBodyCompositionMeasurement =
  typeof bodyCompositionMeasurement.$inferSelect;

export type BodyCompositionMeasurementType =
  (typeof bodyCompositionMeasurementType.enumValues)[number];
export type BodyCompositionLengthUnit =
  (typeof bodyCompositionLengthUnit.enumValues)[number];
export type BodyCompositionWeightUnit =
  (typeof bodyCompositionWeightUnit.enumValues)[number];

export type BodyCompositionMetricState = BodyCompositionMetric & {
  id?: number;
};

export type BodyCompositionMeasurementState = BodyCompositionMeasurement & {
  id?: number;
};

export type BodyCompositionMeasurementWithMetric =
  ExistingBodyCompositionMeasurement & {
    metricName: ExistingBodyCompositionMetric["name"];
    metricMeasurementType: ExistingBodyCompositionMetric["measurementType"];
  };
