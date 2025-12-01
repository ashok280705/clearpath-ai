export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const lat = formData.get('lat');
    const lon = formData.get('lon');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const mlFormData = new FormData();
    mlFormData.append('file', file);
    if (lat) mlFormData.append('lat', lat);
    if (lon) mlFormData.append('lon', lon);

    const mlResponse = await fetch('http://localhost:8000/detect', {
      method: 'POST',
      body: mlFormData,
    });

    if (!mlResponse.ok) {
      throw new Error('ML service error');
    }

    const data = await mlResponse.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
