
<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */


//admin & staff

$routes->get(
    'api/admin/dashboard',
    'Api\AdminDashboardController::index'
);
$routes->post('api/admin/login', 'Api\AdminAuthController::login');
$routes->get('api/admin/check', 'Api\AdminAuthController::check');
$routes->post('api/admin/logout', 'Api\AdminAuthController::logout');

$routes->get(
    'api/admin/reservations',
    'Api\AdminReservationController::index'
);

$routes->get(
    'api/admin/reservations/(:num)',
    'Api\AdminReservationController::show/$1'
);
$routes->get(
    'api/admin/trips',
    'Api\AdminTripController::index'
);
$routes->get(
    'api/admin/passengers',
    'Api\AdminPassengerController::index'
);

$routes->get(
    'api/admin/passengers/(:num)',
    'Api\AdminPassengerController::show/$1'
);
$routes->get(
    'api/admin/payments',
    'Api\AdminPaymentController::index'
);
$routes->get(
    'api/admin/operators',
    'Api\AdminOperatorController::index'
);

$routes->get(
    'api/admin/operators/(:num)',
    'Api\AdminOperatorController::show/$1'
);
$routes->get(
    'api/admin/terminals',
    'Api\AdminTerminalController::index'
);

$routes->get(
    'api/admin/terminals/(:num)',
    'Api\AdminTerminalController::show/$1'
);
$routes->get('api/admin/seats', 'Api\AdminSeatController::index');
$routes->get('api/admin/seats/(:num)', 'Api\AdminSeatController::show/$1');
$routes->get('api/admin/reports', 'Api\AdminReportController::index');

$routes->get(
    'api/staff/check',
    'Api\AdminAuthController::staffCheck'
);

$routes->post(
    'api/staff/logout',
    'Api\AdminAuthController::staffLogout'
);
$routes->get(
    'api/staff/dashboard',
    'Api\StaffDashboardController::index'
);
$routes->get(
    'api/staff/reservations',
    'Api\StaffReservationsController::index'
);

$routes->get(
    'api/staff/reservations/(:num)',
    'Api\StaffReservationsController::show/$1'
);

$routes->get(
    'api/staff/trips',
    'Api\StaffTripsController::index'
);
$routes->get(
    'api/staff/trip-monitoring',
    'Api\StaffTripMonitoringController::index'
);

$routes->get(
    'api/staff/seats',
    'Api\StaffSeatsController::index'
);

$routes->get(
    'api/staff/seats/(:num)',
    'Api\StaffSeatsController::show/$1'
);
$routes->get(
    'api/staff/check-in/(:segment)',
    'Api\StaffCheckinController::lookup/$1'
);

$routes->post(
    'api/staff/check-in',
    'Api\StaffCheckinController::store'
);

$routes->get(
    'api/staff/check-in-history',
    'Api\StaffCheckinHistoryController::index'
);

$routes->get(
    'api/staff/payments',
    'Api\StaffPaymentsController::index'
);

//costumer

$routes->post(
    'api/customer/register',
    'Api\CustomerAuthController::register'
);

$routes->post(
    'api/customer/login',
    'Api\CustomerAuthController::login'
);

$routes->get(
    'api/customer/check',
    'Api\CustomerAuthController::check'
);

$routes->post(
    'api/customer/logout',
    'Api\CustomerAuthController::logout'
);

$routes->get(
    'api/customer/trips',
    'Api\CustomerTripsController::index'
);

$routes->get(
    'api/customer/terminals',
    'Api\CustomerTerminalsController::index'
);

$routes->get(
    'api/customer/trips/(:num)/seats',
    'Api\CustomerSeatsController::show/$1'
);
$routes->post(
    'api/customer/payment/process',
    'Api\CustomerPaymentController::process'
);
$routes->get(
    'api/customer/reservations',
    'Api\CustomerReservationController::index'
);

$routes->get(
    'api/customer/reservations/(:segment)',
    'Api\CustomerReservationController::show/$1'
);