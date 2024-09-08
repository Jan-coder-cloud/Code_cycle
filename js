use deno_core::{
    error::AnyError,
    resolve_path,
    FsModuleLoader,
    JsRuntime,
    PollEventLoopOptions,
    RuntimeOptions,
};
use std::env;
use std::rc::Rc;
use tokio;

async fn run_js(file_path: &str) -> Result<(), AnyError> {
    let main_module = resolve_path(file_path, env::current_dir()?.as_path())?;

    let mut js_runtime = JsRuntime::new(RuntimeOptions {
        module_loader: Some(Rc::new(FsModuleLoader)),
        ..Default::default()
    });

    let mod_id = js_runtime.load_main_es_module(&main_module).await?;
    let result = js_runtime.mod_evaluate(mod_id);

    js_runtime
        .run_event_loop(PollEventLoopOptions {
            wait_for_inspector: false,
            pump_v8_message_loop: false,
        })
        .await?;
    result.await
}

#[tokio::main]
async fn main() {
    if let Err(error) = run_js("./example.js").await {
        eprintln!("error: {:?}", error);
    }
}
