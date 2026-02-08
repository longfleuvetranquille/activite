import logging

from telegram import Bot, Update
from telegram.ext import Application, CommandHandler, ContextTypes

from app.config import settings
from app.services import event_service
from app.telegram.templates import format_daily_digest, format_event_line

logger = logging.getLogger(__name__)


async def cmd_today(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /today command."""
    events = await event_service.get_today_events()
    if not events:
        await update.message.reply_text("😴 Rien de spécial aujourd'hui !")
        return

    lines = ["🌞 *Événements du jour :*\n"]
    for i, e in enumerate(events[:10], 1):
        lines.append(format_event_line(e.model_dump(), i))
        lines.append("")

    await update.message.reply_text("\n".join(lines), parse_mode="Markdown")


async def cmd_week(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /week command."""
    events = await event_service.get_week_events()
    if not events:
        await update.message.reply_text("😴 Rien de prévu cette semaine !")
        return

    lines = ["📅 *Top de la semaine :*\n"]
    for i, e in enumerate(events[:10], 1):
        lines.append(format_event_line(e.model_dump(), i))
        lines.append("")

    await update.message.reply_text("\n".join(lines), parse_mode="Markdown")


async def cmd_top(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /top command."""
    events = await event_service.get_featured_events()
    if not events:
        await update.message.reply_text("Pas de top events en ce moment.")
        return

    lines = ["⭐ *Top 3 événements :*\n"]
    for i, e in enumerate(events[:3], 1):
        lines.append(format_event_line(e.model_dump(), i))
        lines.append("")

    await update.message.reply_text("\n".join(lines), parse_mode="Markdown")


async def cmd_deals(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /deals command."""
    week = await event_service.get_week_events()
    deals = [e for e in week if e.tags_deals]

    if not deals:
        await update.message.reply_text("Pas de bon plan détecté pour le moment.")
        return

    lines = ["💡 *Bons plans détectés :*\n"]
    for i, e in enumerate(deals[:5], 1):
        lines.append(format_event_line(e.model_dump(), i))
        lines.append("")

    await update.message.reply_text("\n".join(lines), parse_mode="Markdown")


async def send_daily_digest():
    """Send the daily digest to the configured Telegram chat."""
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.warning("Telegram not configured, skipping daily digest")
        return

    bot = Bot(token=settings.telegram_bot_token)

    today = await event_service.get_today_events()
    week = await event_service.get_week_events()
    deals = [e for e in week if e.tags_deals]

    message = format_daily_digest(
        today_events=[e.model_dump() for e in today],
        deals=[e.model_dump() for e in deals],
    )

    await bot.send_message(
        chat_id=settings.telegram_chat_id,
        text=message,
        parse_mode="Markdown",
    )
    logger.info("Daily digest sent to Telegram")


def create_telegram_app() -> Application | None:
    """Create and configure the Telegram bot application."""
    if not settings.telegram_bot_token:
        logger.warning("No Telegram bot token configured")
        return None

    app = Application.builder().token(settings.telegram_bot_token).build()

    app.add_handler(CommandHandler("today", cmd_today))
    app.add_handler(CommandHandler("week", cmd_week))
    app.add_handler(CommandHandler("top", cmd_top))
    app.add_handler(CommandHandler("deals", cmd_deals))

    return app
