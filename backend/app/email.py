import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings


def send_verification_email(to_email: str, token: str) -> bool:
    if not settings.smtp_user or not settings.smtp_password:
        return False

    verify_url = f"{settings.app_url}/auth/verify?token={token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Histarix 이메일 인증"
    msg["From"] = f"Histarix <{settings.smtp_user}>"
    msg["To"] = to_email

    html = f"""\
    <div style="max-width:480px;margin:0 auto;padding:40px;font-family:sans-serif;background:#070e1d;color:#dfe5fa;border-radius:16px;">
        <h1 style="color:#85adff;font-size:28px;margin-bottom:8px;">Histarix</h1>
        <p style="color:#a4abbf;margin-bottom:24px;">세계 역사를 탐험하세요</p>
        <p>이메일 인증을 완료하려면 아래 버튼을 클릭해주세요.</p>
        <a href="{verify_url}"
           style="display:inline-block;margin:24px 0;padding:12px 32px;background:linear-gradient(135deg,#85adff,#6e9fff);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
           이메일 인증하기
        </a>
        <p style="color:#6e7588;font-size:12px;margin-top:24px;">
            이 링크는 24시간 동안 유효합니다.<br>
            본인이 요청하지 않았다면 이 메일을 무시해주세요.
        </p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return True
    except Exception:
        return False
