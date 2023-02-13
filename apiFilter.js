export default class APIFilter {
    constructor(offers, checkin) {
        this.offers = offers
        this.checkin = checkin
    }

    getOffers() {
        return this.offers;
    }

    filterByCategory(offers) {
        var filtered = []
        offers.forEach(offer => {
          if ([1,2,4].includes(offer.category)) {
            filtered.push(offer)
          }
        });
        return filtered;
    }

    filterByCheckinDate(offers, checkin) {
        var filtered = []
        offers.forEach(offer => {
          var validTime = new Date(offer.valid_to).getTime()
          var difference = (validTime - checkin.getTime())/(1000*3600*24)
          if (difference >= 5) {
            filtered.push(offer)
          }
        });
        return filtered;
    }

    filterMerchant(offers) {
        var filtered = []
        offers.forEach(offer => {
          var merchantList = offer.merchants
          if (merchantList.length > 1) {
            var minDistance = merchantList[0].distance
            merchantList.forEach(merchant => {
              if (merchant.distance < minDistance){
                minDistance = merchant.distance
              }  
            })
            merchantList = merchantList.filter(merchant => merchant.distance == minDistance)
          }
          offer.merchants = merchantList
          filtered.push(offer)
        });
        return filtered
    }

    selectClosestMerchant(offers) {
        if (offers.length > 1) {
          var minDistance = offers[0].merchants[0].distance
          offers.forEach(offer => {
            if (offer.merchants[0].distance < minDistance){
              minDistance = offer.merchants[0].distance
            }  
          })
          offers = offers.filter(offer => offer.merchants[0].distance == minDistance)
        }
        return offers[0]
      }

    filterSameCategory(offers) {
        var filtered = []
        var restaurantOffers = offers.filter(offer => offer.category == 1)
        var retailOffers = offers.filter(offer => offer.category == 2)
        var activityOffers = offers.filter(offer => offer.category == 4)
        filtered.push(this.selectClosestMerchant(restaurantOffers))
        filtered.push(this.selectClosestMerchant(retailOffers))
        filtered.push(this.selectClosestMerchant(activityOffers))
        return filtered
    }

    selectClosestOffer(offers) {
        if (offers.length > 2) {
          var distances = []
          offers.forEach(offer => {
            distances.push(offer.merchants[0].distance)
          })
          distances = distances.sort((x,y) => x - y).slice(0,2)
          offers = offers.filter(offer => distances.includes(offer.merchants[0].distance))
        }
        return offers
    }

    runFilters() {
        this.offers["offers"] = this.filterByCategory(this.offers["offers"])
        this.offers["offers"] = this.filterByCheckinDate(this.offers["offers"], this.checkin)
        this.offers["offers"] = this.filterMerchant(this.offers["offers"])
        this.offers["offers"] = this.filterSameCategory(this.offers["offers"])
        this.offers["offers"] = this.selectClosestOffer(this.offers["offers"])
    }
}

