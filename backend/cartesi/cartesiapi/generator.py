import inspect

from ..dapp import DApp
from . import models


def generate_cartesiapi(dapp: DApp):

    routers = dapp.routers

    operations = []

    for router in routers:
        operations.update(router.describe_operations())

    cartesi_api = models.CartesiAPI(
        version="0.0.1-wip",
        into=dapp.app_info,
        operations=operations
    )

    return cartesi_api
