FROM public.ecr.aws/lambda/python:3.12

# System deps for weasyprint (PDF generation)
RUN dnf install -y \
    cairo \
    pango \
    gdk-pixbuf2 \
    fontconfig \
    dejavu-sans-fonts \
    dejavu-sans-mono-fonts \
    && dnf clean all

# Python deps
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY handler.py ${LAMBDA_TASK_ROOT}
COPY policy-templates/ ${LAMBDA_TASK_ROOT}/policy-templates/
COPY manifest.json ${LAMBDA_TASK_ROOT}/

CMD ["handler.handler"]
