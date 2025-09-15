import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
  ProductDiscountSelectionStrategy,
  
} from '../generated/api';


/**
  * @typedef {import("../generated/api").CartInput} RunInput
  * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
  */

/**
  * @param {RunInput} input
  * @returns {CartLinesDiscountsGenerateRunResult}
  */

export function cartLinesDiscountsGenerateRun(input) {
 
  const discountsArr= input?.discount?.discountObject?.jsonValue

  if (!discountsArr || discountsArr.length === 0 || !Array.isArray(discountsArr)) {
    throw new Error('No cart lines found');
  }
  discountsArr.sort((a, b) => b.minimumSpend - a.minimumSpend);


  const hasOrderDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Order,
  );


  if (!hasOrderDiscountClass ) {
    return {operations: []};
  }
  const cartTotal = input.cart.lines.reduce(
    (sum, line) => sum + parseFloat(line.cost.subtotalAmount.amount),
    0
  );

  
  let percentage = 0;
  let minimumSpend = discountsArr[0]?.minimumSpend;
  for(let obj of discountsArr){
    if(obj.minimumSpend<=cartTotal){
      percentage=obj.percentage
      minimumSpend=obj.minimumSpend
      break;
    }
  }
  if(percentage==0){
    return{ operations:[]}
  }

  const operations = [];

  if (hasOrderDiscountClass) {
    operations.push({
      orderDiscountsAdd: {
        candidates: [
          {
            message: `${percentage}% off above ${minimumSpend} RS`,
            targets: [
              {
                orderSubtotal: {
                  excludedCartLineIds: [],
                },
              },
            ],
            value: {
              percentage: {
                value: percentage,
              },
            },
          },
        ],
        selectionStrategy: OrderDiscountSelectionStrategy.First,
      },
    });
  }

  // if (hasProductDiscountClass) {
  //   operations.push({
  //     productDiscountsAdd: {
  //       candidates: [
  //         {
  //           message: '20% OFF PRODUCT',
  //           targets: [
  //             {
  //               cartLine: {
  //                 id: maxCartLine.id,
  //               },
  //             },
  //           ],
  //           value: {
  //             percentage: {
  //               value: 20,
  //             },
  //           },
  //         },
  //       ],
  //       selectionStrategy: ProductDiscountSelectionStrategy.First,
  //     },
  //   });
  // }

  return {
    operations,
  };
}