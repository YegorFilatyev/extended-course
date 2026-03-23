from cart import Cart
from validator import Validator
from security import Security
from database import db

import logging

logger = logging.getLogger(__name__)

class Service:

    __cart: dict[int, Cart()] = dict()

    @staticmethod
    def get_all_products():
        try:
            products = db.execute_query(
                "SELECT * FROM get_all_products()",
                fetch_all=True
            )
            db.connection.commit()
            return products, None
        except Exception as e:
            db.connection.rollback()
            logger.error(str(e))
            return None, str(e)

    @staticmethod
    def get_products_by_categories(category_id: int):
        try:
            products = db.execute_query(
                "SELECT * FROM get_products_by_categories(%s)",
                (category_id,),
                fetch_all=True
            )
            db.connection.commit()
            return products, None
        except Exception as e:
            db.connection.rollback()
            return None, str(e)

    @staticmethod
    def add_products_to_order(order_id: int, products: list[list[int, int]]):
        try:
            db.register_product_quantity()

            product_quantity_list = []
            for product in products:
                product_quantity = f"({product[0]},{product[1]})"
                product_quantity_list.append(product_quantity)

            cursor = db.connection.cursor()

            cursor.execute(
                "SELECT add_products_to_order(%s, %s::product_quantity[])",
                (order_id, product_quantity_list)
            )

            db.connection.commit()
            cursor.close()
            return True, None
        except Exception as e:
            db.connection.rollback()
            return False, str(e)

    @staticmethod
    def create_order(user_id: int):
        try:
            cart, error = Service.get_cart(user_id)
            if error:
                return -3, "User don\'t have any products in cart"
            cost = cart['cost']
            products = cart['cart_list']
            products_info: list[list[int, int]] = []
            for product in products:
                product_info: list[int, int] = [product['product_id'], product['product_count']]
                products_info.append(product_info)
            result = db.execute_query(
                "SELECT create_order(%s, %s) as id",
                (user_id, cost),
                fetch_one=True
            )
            order_id = result['id']
            #products_str = ','.join([f"({p[0]},{p[1]})" for p in products_info])
            #products_str = '{' + products_str + '}'
            #db.execute_query(
              #  "SELECT add_products_to_order(%s, %s::product_quantity[])",
             #   (order_id, products_str)
            #)
            #db.connection.commit()
            try:
                success, message = Service.add_products_to_order(order_id, products_info)
                if success:
                    db.connection.commit()
                    #Service.clear_cart(user_id)
                    return order_id, None
                else:
                    Service.delete_order(order_id, user_id)
                    return 0, message
            except Exception as e:
                return -1, str(e)
        except Exception as e:
            db.connection.rollback()
            return -2, str(e)

    @staticmethod
    def __check_email_exists(email: str):
        try:

            result = db.execute_query(
                "SELECT * FROM check_email_exists(%s)",
                (email,),
                fetch_one=True
            )
            db.connection.commit()
            return result, None
        except Exception as e:
            db.connection.rollback()
            return -1, str(e)

    @staticmethod
    def create_user(email: str, password: str, name: str):
        try:
            is_valid, error_msg = Validator.validate_user_data(email, password, name)
            if not is_valid:
                return None, error_msg
            response, message = Service.__check_email_exists(email)
            if response['user_id'] == 0:
                hashed_password = Security.hash_password(password)
                result = db.execute_query(
                    "SELECT create_user(%s, %s, %s) as id",
                    (email, hashed_password, name),
                    fetch_one=True
                )
                db.connection.commit()
                return result['id'], None
            elif response['user_id'] > 0:
                return 0, "Email already used"
            elif response['user_id'] == -1:
                return -1, message
        except Exception as e:
            db.connection.rollback()
            return -2, str(e)

    @staticmethod
    def delete_order(order: int, user: int):
        try:
            db.execute_query(
                "SELECT delete_order(%s, %s)",
                (order, user)
            )
            db.connection.commit()
            return True, None
        except Exception as e:
            db.connection.rollback()
            return False, str(e)

    @staticmethod
    def get_categories():
        try:
            categories = db.execute_query(
                "SELECT * FROM get_categories()",
                fetch_all=True
            )
            db.connection.commit()
            return categories, None
        except Exception as e:
            db.connection.rollback()
            return None, str(e)

    @staticmethod
    def get_orders_by_user(user: int):
        try:
            orders = db.execute_query(
                "SELECT * FROM get_orders_by_user(%s)",
                (user,),
                fetch_all=True
            )
            db.connection.commit()
            for order in orders:
                order['date_order'] = order['date_order'].strftime("%Y-%m-%d")
            return orders, None
        except Exception as e:
            db.connection.rollback()
            return None, str(e)

    @staticmethod
    def get_product_by_id(product_id: int):
        try:
            product = db.execute_query(
                "SELECT * FROM get_product_by_id(%s)",
                (product_id,),
                fetch_one=True
            )
            db.connection.commit()
            return product, None
        except Exception as e:
            db.connection.rollback()
            return None, str(e)

    @staticmethod
    def get_product_images(product_id: int):
        try:
            images = db.execute_query(
                "SELECT * FROM get_product_images(%s)",
                (product_id,),
                fetch_all=True
            )
            db.connection.commit()
            return images, None
        except Exception as e:
            db.connection.rollback()
            return None, str(e)

    @staticmethod
    def get_products_from_order(order: int):
        try:
            products = db.execute_query(
                "SELECT * FROM get_products_from_order(%s)",
                (order,),
                fetch_all=True
            )
            db.connection.commit()
            return products, None
        except Exception as e:
            db.connection.rollback()
            return None, str(e)

    @staticmethod
    def get_user_by_id(user_id: int):
        try:
            user = db.execute_query(
                "SELECT * FROM get_user_by_id(%s)",
                (user_id,),
                fetch_one=True
            )
            db.connection.commit()
            return user, None
        except Exception as e:
            db.connection.rollback()
            return None, str(e)

    @staticmethod
    def update_user(user_id: int, email: str = None, name: str = None):
        try:
            db.execute_query(
                "SELECT update_user(%s, %s, %s)",
                (user_id, email, name)
            )
            db.connection.commit()
            return True, None
        except Exception as e:
            db.connection.rollback()
            return False, str(e)

    @staticmethod
    def login(email: str, password: str):
        try:
            email_check, error = Service.__check_email_exists(email)

            if error:
                return None, error

            if not email_check or email_check['user_id'] == 0:
                return None, "Invalid email or password"

            if not Security.verify_password(password, email_check['password']):
                return None, "Invalid login or password"

            user_id = email_check['user_id']

            user_info, error = Service.get_user_by_id(user_id)

            if error or not user_info:
                return None, error or "User not found"

            user_dict = {
                'id': user_id,
                'email': email,
                'name': user_info['user_name']
            }

            access_token = Security.create_access_token({"sub": str(user_id)})

            return {"user_dict": user_dict, "access_token": access_token}, None

        except Exception as e:
            return None, str(e)

    @staticmethod
    def add_to_cart(user_id: int, product_id: int, product_price: int):
        try:
            product, error = Service.get_product_by_id(product_id)
            if error:
                return False, "Product don\'t exist"
            if user_id not in Service.__cart:
                Service.__cart[user_id] = Cart()
            user_cart = Service.__cart[user_id]
            user_cart.add_product(product_id, product_price)
            return True, None
        except Exception as e:
            return False, str(e)

    @staticmethod
    def remove_from_cart(user_id: int, product_id: int):
        try:
            product, error = Service.get_product_by_id(product_id)
            if error:
                return False, "Product don\'t exist"
            if user_id not in Service.__cart:
                return False, "User has empty cart"
            user_cart = Service.__cart[user_id]
            user_cart.remove_product(product_id)
            if user_cart.count == 0:
                Service.__cart.pop(user_id)
            return True, None
        except Exception as e:
            return False, str(e)

    @staticmethod
    def remove_position(user_id: int, product_id: int):
        try:
            product, error = Service.get_product_by_id(product_id)
            if error:
                return False, "Product don\'t exist"
            if user_id not in Service.__cart:
                return False, "User has empty cart"
            user_cart = Service.__cart[user_id]
            user_cart.remove_position(product_id)
            if user_cart.count == 0:
                Service.__cart.pop(user_id)
            return True, None
        except Exception as e:
            return False, str(e)

    @staticmethod
    def clear_cart(user_id: int):
        try:
            if user_id not in Service.__cart:
                return False, "User has empty cart"
            user_cart = Service.__cart[user_id]
            user_cart.clear_cart()
            Service.__cart.pop(user_id)
            return True, None
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_cart(user_id: int):
        try:
            if user_id not in Service.__cart:
                return [], None
            cart_list, count, cost = Service.__cart[user_id].get_cart()
            products_info = []
            for key, value in cart_list.items():
                product, error = Service.get_product_by_id(key)
                if error:
                    return None, error
                images, error = Service.get_product_images(key)
                if error:
                    return None, error
                image = images[0]['path']
                product_info = {
                    "product_id": key,
                    "product_name": product['product_name'],
                    "product_image": image,
                    "product_price": value[1],
                    "product_count": value[0]
                }
                products_info.append(product_info)

            cart_info = {
                "cart_list": products_info,
                "count": count,
                "cost": cost
            }
            return cart_info, None
        except Exception as e:
            return None, str(e)
