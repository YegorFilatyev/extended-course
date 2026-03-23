class Cart:
    def __init__(self):
        self.list: dict[int, list[int]] = dict()
        self.count = 0
        self.cost = 0

    def add_product(self, product_id: int, product_cost: int = None):
        if product_id not in self.list:
            self.list[product_id] = [1, product_cost]
            self.__update_count_and_cost(True, 1, product_cost)
            return

        self.list[product_id][0] += 1
        self.__update_count_and_cost(True, 1, self.list[product_id][1])

    def remove_product(self, product_id: int):
        if product_id in self.list:
            if self.list[product_id][0] == 1:
                removed = self.list.pop(product_id)
                self.__update_count_and_cost(False, 1, removed[1])
            else:
                self.list[product_id][0] -= 1
                self.__update_count_and_cost(False, 1, self.list[product_id][1])

    def remove_position(self, product_id: int):
        if product_id in self.list:
            removed = self.list.pop(product_id)
            self.__update_count_and_cost(False, removed[0], removed[1])

    def __update_count_and_cost(self, is_increase: bool, quantity: int, price: int):
        if not is_increase:
            quantity *= -1
            price *= -1
        self.count += quantity
        self.cost += price

    def clear_cart(self):
        self.list.clear()
        self.count = 0
        self.cost = 0

    def get_cart(self):
        return self.list, self.count, self.cost
