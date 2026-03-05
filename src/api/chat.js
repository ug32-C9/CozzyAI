/**
 * Frontend helper to call the Cloudflare Pages function.
 * In a standard setup, you'd just call fetch('/api/chat') directly.
 */

export const sendChat = async (messages, signal) => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to connect to AI service');
    }

    return response.body;
};
