export async function deleteCookies(): Promise<void>{
try {
    const response = await fetch('/api/auth', {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
    },
    });

    if (!response.ok) {
        throw new Error('Failed to logout');
    }

    console.log('Logout successful');
} catch (error) {
    console.error('Error during logout:', error);
}
};

export async function addCookies(walletAddress: string, status: string): Promise<boolean> {
    try {
        let rank = 0;
        if (status == "Platinum Member"){
            rank = 3;
        } else if (status == "Gold Member"){
            rank = 2;
        } else if (status == "Silver Member"){
            rank = 1;
        }

        const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: walletAddress, status: rank }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        console.log('Login successful:', data);
        return true;
    } catch (error) {
        console.error('Error during login:', error);
    }
    return false;
}

export async function checkSession(walletAddress: string, rank: number) {
    try {
        const response = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'same-origin',
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Session verified:', data);
            if (data.wallet?.status >= rank && data.wallet?.address == walletAddress){
                return data.wallet?.status;
            }
            } else {
                const errorData = await response.json();
                console.error('Session verification failed:', errorData);
            }
    } catch (error) {
        console.error('Error during session check:', error);
    }
    return false;
}