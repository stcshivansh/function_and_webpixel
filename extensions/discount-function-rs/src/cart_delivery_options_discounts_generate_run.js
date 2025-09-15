import {
  DeliveryDiscountSelectionStrategy,
  DiscountClass,
} from "../generated/api";

/**
  * @typedef {import("../generated/api").DeliveryInput} RunInput
  * @typedef {import("../generated/api").CartDeliveryOptionsDiscountsGenerateRunResult} CartDeliveryOptionsDiscountsGenerateRunResult
  */

/**
  * @param {RunInput} input
  * @returns {CartDeliveryOptionsDiscountsGenerateRunResult}
  */

export function cartDeliveryOptionsDiscountsGenerateRun(input) {
  console.log(JSON.stringify(input, null, 2))
  const firstDeliveryGroup = input.cart.deliveryGroups[0];
  if (!firstDeliveryGroup) {
    throw new Error("No delivery groups found");
  }

  const hasShippingDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Shipping,
  );

  if (!hasShippingDiscountClass) {
    return {operations: []};
  }

  const discountsArr= input?.discount?.metafield?.jsonValue?.percentage
  if (!discountsArr ){
    return {
      operations:[]
    }
  }

  return {
    operations: [
      {
        deliveryDiscountsAdd: {
          candidates: [
            {
              message: discountsArr + "% OFF ON DELIVERY",
              targets: [
                {
                  deliveryGroup: {
                    id: firstDeliveryGroup.id,
                  },
                },
              ],
              value: {
                percentage: {
                  value:discountsArr,
                },
              },
            },
          ],
          selectionStrategy: DeliveryDiscountSelectionStrategy.All,
        },
      },
    ],
  };
}