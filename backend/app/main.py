import atexit
import os

import uvicorn
from fastapi import FastAPI, Body, Path, Request, Depends, HTTPException

from fastapi.responses import JSONResponse, FileResponse

from fastapi.middleware.cors import CORSMiddleware

from connection import connection

from service import Service

from security import Security

from pathlib import Path as plPath

import logging

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

atexit.register(connection.close_connections)

connection.init_connections()


async def get_current_user_dependency(
    request: Request,
    credentials=Depends(Security.security_scheme)
) -> int:
    return await Security.get_current_user(request, credentials)


@app.get("/categories")
async def get_categories():
    try:
        categories, error = Service.get_categories()
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"categories": categories}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_categories - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/products")
async def get_all_products():
    try:
        products, error = Service.get_all_products()
        if error:
            return JSONResponse(content={"error": error}, status_code=400)
        return JSONResponse(content={"products": products}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_all_products - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/products/{category_id}")
async def get_products_by_categories(category_id: int = Path()):
    try:
        products, error = Service.get_products_by_categories(category_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=400)
        return JSONResponse(content={"products": products}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_products_by_categories - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/product/{product_id}")
async def get_product_by_id(product_id: int = Path()):
    try:
        product, error = Service.get_product_by_id(product_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"product": product}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_product_by_id - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/products/{product_id}/images")
async def get_product_images(product_id: int = Path()):
    try:
        images, error = Service.get_product_images(product_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"images": images}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_product_images - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/register")
async def register_user(email: str = Body(embed=True), password: str = Body(embed=True), name: str = Body(embed=True)):
    try:
        user_id, message = Service.create_user(email, password, name)
        if message:
            return JSONResponse(content={"error": message}, status_code=400)
        return JSONResponse(content={"id": user_id}, status_code=201)
    except Exception as e:
        logger.error(f"Error in register_user - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/login")
async def login(email: str = Body(embed=True), password: str = Body(embed=True)):
    try:
        user_info, error = Service.login(email, password)
        if error:
            return JSONResponse(content={"error": error}, status_code=401)

        response = JSONResponse(content={"user_info": user_info, "message": "Login successful"}, status_code=200)

        response.set_cookie(
            key="access_token",
            value=user_info['access_token'],
            httponly=True,
            max_age=30 * 24 * 60 * 60,
            expires=30 * 24 * 60 * 60,
            path="/",
            samesite="lax",
            secure=False,
        )
        logger.info(f"Login successful for user: {user_info['user_dict']['id']}")
        logger.info(f"Token set in cookie: Bearer {user_info['access_token'][:20]}...")
        logger.debug(f"Response headers: {response.headers}")
        return response
    except Exception as e:
        logger.error(f"Error in login - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out successfully"}, status_code=200)
    response.delete_cookie("access_token", path="/")
    logger.info(f"INFO: User successfully logout")
    return response


@app.get("/images/{category_id}/{product_id}/{image_name}")
async def get_image(category_id: str = Path(), product_id: str = Path(), image_name: str = Path()):
    image_dir = plPath(os.getenv("IMAGE_DIR"))
    file_path = image_dir / category_id / product_id / image_name

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(file_path)


@app.get("/verify")
async def verify_token(
    user_id: int = Depends(get_current_user_dependency)
):
    try:
        user, error = Service.get_user_by_id(user_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"user": user}, status_code=200)
    except Exception as e:
        logger.error(f"Error in verify_token - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/new_order")
async def create_order(
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        order_id, error = Service.create_order(user_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)

        #orders, error = Service.get_orders_by_user(user_id)
        #if error:
            #return JSONResponse(content={"error": f"Error trying get orders: {error}"}, status_code=500)

        return JSONResponse(content={"order_id": order_id}, status_code=201)
    except Exception as e:
        logger.error(f"Error in create_order - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.delete("/order/{order_id}")
async def delete_order(
        order_id: int = Path(),
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        success, message = Service.delete_order(order_id, user_id)
        if not success:
            return JSONResponse(content={"error": message}, status_code=500)
        return JSONResponse(content={"message": "Order was deleted"}, status_code=200)
    except Exception as e:
        logger.error(f"Error in delete_order - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/orders")
async def get_orders_by_user(
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        orders, error = Service.get_orders_by_user(user_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"orders": orders}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_orders_by_user - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/orders/{order_id}/products")
async def get_products_from_order(
        order_id: int = Path(),
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        products, error = Service.get_products_from_order(order_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"products": products}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_products_from_order - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/user/{user_id}")
async def get_user_by_id(
        user_id: int = Path(),
        current_user: int = Depends(get_current_user_dependency)
):
    if current_user != user_id:
        return JSONResponse(content={"error": "Access denied"}, status_code=403)

    try:
        user, error = Service.get_user_by_id(user_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"user": user}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_user_by_id - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.put("/user/{user_id}")
async def update_user(
        user_id: int = Path(),
        email: str = Body(embed=True, default=None),
        name: str = Body(embed=True, default=None),
        current_user: int = Depends(get_current_user_dependency)
):

    if current_user != user_id:
        return JSONResponse(content={"error": "Access denied"}, status_code=403)

    try:
        success, error = Service.update_user(user_id, email, name)
        if not success:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"message": "User was successfully updated"}, status_code=200)
    except Exception as e:
        logger.error(f"Error in update_user - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/cart/add")
async def add_to_cart(
        product_id: int = Body(embed=True),
        product_price: int = Body(embed=True),
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        success, error = Service.add_to_cart(user_id, product_id, product_price)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"message": "Product was added to cart"}, status_code=201)
    except Exception as e:
        logger.error(f"Error in add_to_cart - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/cart/remove_product")
async def remove_from_cart(
        product_id: int = Body(embed=True),
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        success, error = Service.remove_from_cart(user_id, product_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"message": "Product was removed from cart"}, status_code=200)
    except Exception as e:
        logger.error(f"Error in remove_from_cart - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.delete("/cart/remove_position")
async def remove_position(
        product_id: int = Body(embed=True),
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        success, error = Service.remove_position(user_id, product_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"message": "Position was removed"}, status_code=200)
    except Exception as e:
        logger.error(f"Error in remove_position - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.delete("/cart/clear")
async def clear_cart(
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        success, error = Service.clear_cart(user_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"message": "Cart was cleared"}, status_code=200)
    except Exception as e:
        logger.error(f"Error in clear_cart - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/cart")
async def get_cart(
        user_id: int = Depends(get_current_user_dependency)
):
    try:
        cart_info, error = Service.get_cart(user_id)
        if error:
            return JSONResponse(content={"error": error}, status_code=500)
        return JSONResponse(content={"cart_info": cart_info}, status_code=200)
    except Exception as e:
        logger.error(f"Error in get_cart - {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
