<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class CustomerAuth implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $session = session();

        // Accept boolean true or integer/string 1.
        $loggedIn = $session->get('customer_logged_in');

        if (in_array($loggedIn, [true, 1, '1'], true)) {
            return;
        }

        // Remember the requested page.
        $uri = $request->getUri();
        $redirect = '/' . ltrim($uri->getPath(), '/');

        $query = $uri->getQuery();

        if (!empty($query)) {
            $redirect .= '?' . $query;
        }

        $session->set('customer_redirect', $redirect);

        return redirect()->to(site_url('customer/login'))
            ->with('error', 'Please log in to continue your booking.');
    }

    public function after(
        RequestInterface $request,
        ResponseInterface $response,
        $arguments = null
    ) {
        // No after-filter processing needed.
    }
}
