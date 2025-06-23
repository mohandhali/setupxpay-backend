package com.setupxpay.app;

// ❌ Remove this line because you're extending it, not importing as a separate class
// import com.google.androidbrowserhelper.trusted.DelegationService;

public class DelegationService extends com.google.androidbrowserhelper.trusted.DelegationService {
    @Override
    public void onCreate() {
        super.onCreate();
        // No need to register location handler
    }
}
