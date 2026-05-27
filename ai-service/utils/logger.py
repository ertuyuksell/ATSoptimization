from loguru import logger
import sys

logger.remove()
logger.add(sys.stdout, level="INFO", enqueue=True,
           format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:{line} - <level>{message}</level>")

__all__ = ["logger"]
